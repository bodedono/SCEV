import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  // Ler multipart form data
  const formData = await readMultipartFormData(event)
  if (!formData) {
    throw createError({ statusCode: 400, message: 'Nenhum arquivo enviado' })
  }

  const comprovanteField = formData.find(f => f.name === 'comprovante')
  const parcelaIdField = formData.find(f => f.name === 'parcela_id')

  if (!comprovanteField?.data || !parcelaIdField?.data) {
    throw createError({ statusCode: 400, message: 'Comprovante e parcela_id são obrigatórios' })
  }

  const parcelaId = Number(parcelaIdField.data.toString())

  // Buscar dados da parcela no Supabase (server-side com service key)
  const supabase = createClient(
    config.public.supabaseUrl as string || process.env.SUPABASE_URL!,
    config.supabaseServiceKey as string
  )

  const { data: parcela, error: parcelaError } = await supabase
    .from('parcelas')
    .select(`
      *,
      emprestimo:emprestimos(funcionario:funcionarios(nome)),
      vale:vales(funcionario:funcionarios(nome))
    `)
    .eq('id', parcelaId)
    .single()

  if (parcelaError || !parcela) {
    throw createError({ statusCode: 404, message: 'Parcela não encontrada' })
  }

  const nomeFuncionario = parcela.emprestimo?.funcionario?.nome
    ?? parcela.vale?.funcionario?.nome
    ?? 'Desconhecido'

  // Converter imagem para base64
  const base64Image = comprovanteField.data.toString('base64')
  const mimeType = comprovanteField.type || 'image/jpeg'

  // Enviar para Groq Vision API
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const groqResponse = await $fetch<any>('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.groqApiKey}`,
      'Content-Type': 'application/json'
    },
    body: {
      model: 'llama-3.2-90b-vision-preview',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Analise este comprovante de pagamento/recibo e extraia as seguintes informações em formato JSON:
              {
                "valor": (valor numérico encontrado, sem R$, usar ponto como separador decimal),
                "data": (data encontrada no formato YYYY-MM-DD, ou null),
                "nome_pagador": (nome de quem pagou, ou null),
                "nome_recebedor": (nome de quem recebeu, ou null),
                "tipo_documento": (tipo: "pix", "transferencia", "recibo", "contracheque", "boleto", "outro"),
                "texto_extraido": (resumo do que está escrito no documento)
              }

              Retorne APENAS o JSON, sem markdown, sem explicação.`
            },
            {
              type: 'image_url',
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`
              }
            }
          ]
        }
      ],
      max_tokens: 500,
      temperature: 0.1
    }
  })

  // Extrair resposta da IA
  let analise
  try {
    const resposta = groqResponse.choices?.[0]?.message?.content ?? '{}'
    // Limpar possíveis markdown wrappers
    const jsonStr = resposta.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    analise = JSON.parse(jsonStr)
  } catch {
    analise = { erro: 'Não foi possível analisar o comprovante' }
  }

  // Comparar com dados da parcela
  const valorParcela = Number(parcela.valor)
  const valorComprovante = analise.valor ? Number(analise.valor) : null

  const validacao = {
    valor_bate: valorComprovante !== null && Math.abs(valorComprovante - valorParcela) < 0.50,
    nome_encontrado: analise.nome_pagador
      ? analise.nome_pagador.toLowerCase().includes(nomeFuncionario.toLowerCase().split(' ')[0])
      || nomeFuncionario.toLowerCase().includes(analise.nome_pagador.toLowerCase().split(' ')[0])
      : false,
    documento_valido: analise.tipo_documento !== 'outro'
  }

  const alertas: string[] = []

  if (valorComprovante !== null && !validacao.valor_bate) {
    alertas.push(`Valor do comprovante (R$ ${valorComprovante?.toFixed(2)}) difere da parcela (R$ ${valorParcela.toFixed(2)})`)
  }

  if (analise.nome_pagador && !validacao.nome_encontrado) {
    alertas.push(`Nome no comprovante ("${analise.nome_pagador}") pode não corresponder ao funcionário ("${nomeFuncionario}")`)
  }

  if (!valorComprovante) {
    alertas.push('Não foi possível identificar o valor no comprovante')
  }

  return {
    analise,
    parcela: {
      id: parcela.id,
      valor: valorParcela,
      funcionario: nomeFuncionario,
      data_prevista: parcela.data_prevista
    },
    validacao,
    alertas,
    aprovado_automaticamente: alertas.length === 0
  }
})
