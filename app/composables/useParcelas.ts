import type { Parcela } from '~/types'

export const useParcelas = () => {
  const supabase = useSupabaseClient()
  const { usuario } = useAuth()
  const parcelas = ref<Parcela[]>([])
  const carregando = ref(false)

  const listarPendentes = async (_unidadeId?: number) => {
    carregando.value = true
    try {
      const { data, error } = await supabase
        .from('parcelas')
        .select(`
          *,
          emprestimo:emprestimos(
            id,
            funcionario:funcionarios(id, nome, matricula, unidade_id, unidade:unidades(id, nome))
          ),
          vale:vales(
            id,
            funcionario:funcionarios(id, nome, matricula, unidade_id, unidade:unidades(id, nome))
          )
        `)
        .in('status', ['PENDENTE', 'ATRASADA'])
        .order('data_prevista', { ascending: true })

      if (error) throw error

      // Normalizar dados: extrair funcionario do emprestimo ou vale
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const normalized = (data ?? []).map((p: any) => ({
        ...p,
        funcionario: p.emprestimo?.funcionario ?? p.vale?.funcionario ?? null
      }))

      parcelas.value = normalized as Parcela[]
    } finally {
      carregando.value = false
    }
  }

  const darBaixa = async (parcelaId: number, comprovante: File, observacoes?: string) => {
    // 1. Upload do comprovante
    const ext = comprovante.name.split('.').pop()
    const fileName = `${parcelaId}_${Date.now()}.${ext}`

    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('comprovantes')
      .upload(fileName, comprovante)

    if (uploadError) throw uploadError

    // 2. Atualizar parcela
    const { error } = await supabase
      .from('parcelas')
      .update({
        status: 'PAGA',
        data_pagamento: new Date().toISOString().split('T')[0],
        usuario_baixa_id: usuario.value!.id,
        comprovante_url: uploadData.path,
        observacoes: observacoes || null
      })
      .eq('id', parcelaId)

    if (error) throw error

    // 3. O trigger no banco verifica automaticamente se o empréstimo/vale foi quitado
  }

  const analisarComprovante = async (parcelaId: number, comprovante: File) => {
    const formData = new FormData()
    formData.append('comprovante', comprovante)
    formData.append('parcela_id', String(parcelaId))

    const { data } = await useFetch('/api/comprovante/analisar', {
      method: 'POST',
      body: formData
    })

    return data.value
  }

  return {
    parcelas,
    carregando,
    listarPendentes,
    darBaixa,
    analisarComprovante
  }
}
