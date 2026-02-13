export type PeriodoPreset = 'mes_atual' | 'trimestre' | 'semestre' | 'ano' | 'custom'

export interface AnalyticsFiltros {
  periodo: PeriodoPreset
  dataInicio: string
  dataFim: string
  unidadeId?: number
}

export interface KpiData {
  totalEmprestado: number
  totalVales: number
  totalRecebido: number
  totalPendente: number
  taxaAdimplencia: number
  ticketMedioEmprestimo: number
  ticketMedioVale: number
  variacaoEmprestado: number
  variacaoVales: number
  variacaoRecebido: number
  variacaoAdimplencia: number
}

export interface EvolucaoMensal {
  labels: string[]
  emprestimos: number[]
  vales: number[]
  recebimentos: number[]
}

export interface StatusItem {
  status: string
  count: number
  valor: number
}

export interface DistribuicaoStatus {
  emprestimos: StatusItem[]
  vales: StatusItem[]
}

export interface UnidadeMetrica {
  unidade: string
  emprestimos: number
  vales: number
  saldoDevedor: number
}

export interface VencimentosFaixa {
  emDia: number
  vence7dias: number
  vence30dias: number
  atrasadas: number
}

export interface TopDevedor {
  funcionario: string
  unidade: string
  saldoDevedor: number
  parcelasAtrasadas: number
}

export interface AnalyticsData {
  kpis: KpiData
  evolucaoMensal: EvolucaoMensal
  distribuicaoStatus: DistribuicaoStatus
  porUnidade: UnidadeMetrica[]
  vencimentos: VencimentosFaixa
  topDevedores: TopDevedor[]
}

// Calcula datas de início/fim para um preset de período
export const calcularPeriodo = (preset: PeriodoPreset): { inicio: string, fim: string } => {
  const hoje = new Date()
  const fim = hoje.toISOString().split('T')[0]!
  let inicio: Date

  switch (preset) {
    case 'mes_atual':
      inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
      break
    case 'trimestre':
      inicio = new Date(hoje.getFullYear(), hoje.getMonth() - 2, 1)
      break
    case 'semestre':
      inicio = new Date(hoje.getFullYear(), hoje.getMonth() - 5, 1)
      break
    case 'ano':
      inicio = new Date(hoje.getFullYear(), 0, 1)
      break
    default:
      inicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1)
  }

  return { inicio: inicio.toISOString().split('T')[0]!, fim }
}

// Calcula período anterior equivalente para comparações
const periodoAnterior = (inicio: string, fim: string): { inicio: string, fim: string } => {
  const d1 = new Date(inicio)
  const d2 = new Date(fim)
  const diff = d2.getTime() - d1.getTime()
  const novoFim = new Date(d1.getTime() - 1) // dia anterior ao início
  const novoInicio = new Date(novoFim.getTime() - diff)
  return {
    inicio: novoInicio.toISOString().split('T')[0]!,
    fim: novoFim.toISOString().split('T')[0]!
  }
}

const variacao = (atual: number, anterior: number): number => {
  if (anterior === 0) return atual > 0 ? 100 : 0
  return ((atual - anterior) / anterior) * 100
}

const MESES_PT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

export const useAnalytics = () => {
  const supabase = useSupabaseClient()
  const carregando = ref(false)

  const periodoInicial = calcularPeriodo('semestre')
  const filtros = ref<AnalyticsFiltros>({
    periodo: 'semestre',
    dataInicio: periodoInicial.inicio,
    dataFim: periodoInicial.fim
  })

  const dados = ref<AnalyticsData>({
    kpis: {
      totalEmprestado: 0,
      totalVales: 0,
      totalRecebido: 0,
      totalPendente: 0,
      taxaAdimplencia: 0,
      ticketMedioEmprestimo: 0,
      ticketMedioVale: 0,
      variacaoEmprestado: 0,
      variacaoVales: 0,
      variacaoRecebido: 0,
      variacaoAdimplencia: 0
    },
    evolucaoMensal: { labels: [], emprestimos: [], vales: [], recebimentos: [] },
    distribuicaoStatus: { emprestimos: [], vales: [] },
    porUnidade: [],
    vencimentos: { emDia: 0, vence7dias: 0, vence30dias: 0, atrasadas: 0 },
    topDevedores: []
  })

  const atualizarPeriodo = (preset: PeriodoPreset) => {
    filtros.value.periodo = preset
    if (preset !== 'custom') {
      const { inicio, fim } = calcularPeriodo(preset)
      filtros.value.dataInicio = inicio
      filtros.value.dataFim = fim
    }
  }

  const carregar = async () => {
    carregando.value = true
    try {
      const { dataInicio, dataFim, unidadeId } = filtros.value
      const anterior = periodoAnterior(dataInicio, dataFim)

      // Buscar todos os dados em paralelo
      const [
        emprestimosAtual,
        emprestimosAnterior,
        valesAtual,
        valesAnterior,
        parcelasAll,
        parcelasAnterior,
        unidadesData,
        saldoData
      ] = await Promise.all([
        buscarEmprestimos(dataInicio, dataFim, unidadeId),
        buscarEmprestimos(anterior.inicio, anterior.fim, unidadeId),
        buscarVales(dataInicio, dataFim, unidadeId),
        buscarVales(anterior.inicio, anterior.fim, unidadeId),
        buscarParcelas(dataInicio, dataFim, unidadeId),
        buscarParcelas(anterior.inicio, anterior.fim, unidadeId),
        buscarUnidades(),
        buscarSaldoDevedores(unidadeId)
      ])

      // KPIs
      const totalEmpAtual = somaValor(emprestimosAtual, 'valor_total')
      const totalEmpAnterior = somaValor(emprestimosAnterior, 'valor_total')
      const totalValesAtual = somaValor(valesAtual, 'valor')
      const totalValesAnterior = somaValor(valesAnterior, 'valor')

      const parcelasPagas = parcelasAll.filter(p => p.status === 'PAGA')
      const parcelasPagasAnterior = parcelasAnterior.filter(p => p.status === 'PAGA')
      const totalRecebidoAtual = somaValor(parcelasPagas, 'valor')
      const totalRecebidoAnterior = somaValor(parcelasPagasAnterior, 'valor')

      const parcelasPendentes = parcelasAll.filter(p => p.status === 'PENDENTE' || p.status === 'ATRASADA')
      const totalPendente = somaValor(parcelasPendentes, 'valor')

      // Taxa de adimplência: % de parcelas vencidas que foram pagas no prazo
      const parcelasVencidas = parcelasAll.filter(p => p.data_prevista <= dataFim)
      const pagasNoPrazo = parcelasVencidas.filter(
        p => p.status === 'PAGA' && p.data_pagamento && p.data_pagamento <= p.data_prevista
      )
      const taxaAtual = parcelasVencidas.length > 0
        ? (pagasNoPrazo.length / parcelasVencidas.length) * 100
        : 0

      const parcelasVencidasAnt = parcelasAnterior.filter(p => p.data_prevista <= anterior.fim)
      const pagasNoPrazoAnt = parcelasVencidasAnt.filter(
        p => p.status === 'PAGA' && p.data_pagamento && p.data_pagamento <= p.data_prevista
      )
      const taxaAnterior = parcelasVencidasAnt.length > 0
        ? (pagasNoPrazoAnt.length / parcelasVencidasAnt.length) * 100
        : 0

      dados.value.kpis = {
        totalEmprestado: totalEmpAtual,
        totalVales: totalValesAtual,
        totalRecebido: totalRecebidoAtual,
        totalPendente,
        taxaAdimplencia: Math.round(taxaAtual * 10) / 10,
        ticketMedioEmprestimo: emprestimosAtual.length > 0 ? totalEmpAtual / emprestimosAtual.length : 0,
        ticketMedioVale: valesAtual.length > 0 ? totalValesAtual / valesAtual.length : 0,
        variacaoEmprestado: Math.round(variacao(totalEmpAtual, totalEmpAnterior) * 10) / 10,
        variacaoVales: Math.round(variacao(totalValesAtual, totalValesAnterior) * 10) / 10,
        variacaoRecebido: Math.round(variacao(totalRecebidoAtual, totalRecebidoAnterior) * 10) / 10,
        variacaoAdimplencia: Math.round((taxaAtual - taxaAnterior) * 10) / 10
      }

      // Evolução mensal
      dados.value.evolucaoMensal = calcularEvolucaoMensal(
        emprestimosAtual,
        valesAtual,
        parcelasPagas,
        dataInicio,
        dataFim
      )

      // Distribuição de status
      dados.value.distribuicaoStatus = {
        emprestimos: agruparPorStatus(emprestimosAtual, 'status', 'valor_total'),
        vales: agruparPorStatus(valesAtual, 'status', 'valor')
      }

      // Por unidade
      dados.value.porUnidade = calcularPorUnidade(emprestimosAtual, valesAtual, saldoData, unidadesData)

      // Vencimentos
      dados.value.vencimentos = calcularVencimentos(parcelasPendentes)

      // Top devedores
      dados.value.topDevedores = saldoData.slice(0, 10)
    } finally {
      carregando.value = false
    }
  }

  // --- Queries Supabase ---

  const buscarEmprestimos = async (inicio: string, fim: string, unidadeId?: number) => {
    let query = supabase
      .from('emprestimos')
      .select('id, valor_total, num_parcelas, valor_parcela, status, data_solicitacao, funcionario_id, funcionario:funcionarios(unidade_id)')
      .gte('data_solicitacao', inicio)
      .lte('data_solicitacao', fim)
      .not('status', 'eq', 'REJEITADO')

    if (unidadeId) {
      query = query.eq('funcionario.unidade_id', unidadeId)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await query as { data: any[] | null }
    return (data ?? []).filter(e => !unidadeId || e.funcionario?.unidade_id === unidadeId)
  }

  const buscarVales = async (inicio: string, fim: string, unidadeId?: number) => {
    let query = supabase
      .from('vales')
      .select('id, valor, status, created_at, funcionario_id, funcionario:funcionarios(unidade_id)')
      .gte('created_at', inicio)
      .lte('created_at', fim + 'T23:59:59')
      .not('status', 'eq', 'REJEITADO')

    if (unidadeId) {
      query = query.eq('funcionario.unidade_id', unidadeId)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await query as { data: any[] | null }
    return (data ?? []).filter(v => !unidadeId || v.funcionario?.unidade_id === unidadeId)
  }

  const buscarParcelas = async (inicio: string, fim: string, unidadeId?: number) => {
    const query = supabase
      .from('parcelas')
      .select('id, valor, status, data_prevista, data_pagamento, tipo, funcionario_id, emprestimo_id, vale_id')
      .gte('data_prevista', inicio)
      .lte('data_prevista', fim)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await query as { data: any[] | null }
    let result = data ?? []

    if (unidadeId) {
      // Filtrar por unidade via funcionário
      const { data: funcIds } = await supabase
        .from('funcionarios')
        .select('id')
        .eq('unidade_id', unidadeId)

      const ids = new Set((funcIds ?? []).map(f => f.id))
      // Precisamos mapear parcelas → funcionário via empréstimo/vale
      const empIds = result.filter(p => p.emprestimo_id).map(p => p.emprestimo_id)
      const valeIds = result.filter(p => p.vale_id).map(p => p.vale_id)

      const [empMap, valeMap] = await Promise.all([
        empIds.length > 0
          ? supabase.from('emprestimos').select('id, funcionario_id').in('id', empIds)
          : { data: [] },
        valeIds.length > 0
          ? supabase.from('vales').select('id, funcionario_id').in('id', valeIds)
          : { data: [] }
      ])

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const empFuncMap = new Map((empMap.data ?? []).map((e: any) => [e.id, e.funcionario_id]))
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const valeFuncMap = new Map((valeMap.data ?? []).map((v: any) => [v.id, v.funcionario_id]))

      result = result.filter((p) => {
        const funcId = p.emprestimo_id ? empFuncMap.get(p.emprestimo_id) : valeFuncMap.get(p.vale_id)
        return ids.has(funcId)
      })
    }

    return result
  }

  const buscarUnidades = async () => {
    const { data } = await supabase
      .from('unidades')
      .select('id, nome')
      .eq('ativo', true)
      .order('nome')

    return (data ?? []) as { id: number, nome: string }[]
  }

  const buscarSaldoDevedores = async (unidadeId?: number): Promise<TopDevedor[]> => {
    let query = supabase
      .from('funcionarios')
      .select('id, nome, unidade:unidades(nome)')
      .eq('ativo', true)

    if (unidadeId) {
      query = query.eq('unidade_id', unidadeId)
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: funcs } = await query as { data: any[] | null }
    if (!funcs?.length) return []

    const funcIds = funcs.map(f => f.id)

    const { data: parcelas } = await supabase
      .from('parcelas')
      .select('valor, status, emprestimo_id, vale_id')
      .in('status', ['PENDENTE', 'ATRASADA'])

    // Mapear parcelas → funcionário
    const empIds = (parcelas ?? []).filter(p => p.emprestimo_id).map(p => p.emprestimo_id)
    const valeIds = (parcelas ?? []).filter(p => p.vale_id).map(p => p.vale_id)

    const [empMap, valeMap] = await Promise.all([
      empIds.length > 0
        ? supabase.from('emprestimos').select('id, funcionario_id').in('id', [...new Set(empIds)])
        : { data: [] },
      valeIds.length > 0
        ? supabase.from('vales').select('id, funcionario_id').in('id', [...new Set(valeIds)])
        : { data: [] }
    ])

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const empFuncMap = new Map((empMap.data ?? []).map((e: any) => [e.id, e.funcionario_id]))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const valeFuncMap = new Map((valeMap.data ?? []).map((v: any) => [v.id, v.funcionario_id]))

    // Acumular por funcionário
    const saldos = new Map<number, { saldo: number, atrasadas: number }>()
    for (const p of (parcelas ?? [])) {
      const funcId = p.emprestimo_id ? empFuncMap.get(p.emprestimo_id) : valeFuncMap.get(p.vale_id)
      if (!funcId || !funcIds.includes(funcId)) continue
      const entry = saldos.get(funcId) ?? { saldo: 0, atrasadas: 0 }
      entry.saldo += Number(p.valor)
      if (p.status === 'ATRASADA') entry.atrasadas++
      saldos.set(funcId, entry)
    }

    return funcs
      .map(f => ({
        funcionario: f.nome as string,
        unidade: (f.unidade?.nome ?? '—') as string,
        saldoDevedor: saldos.get(f.id)?.saldo ?? 0,
        parcelasAtrasadas: saldos.get(f.id)?.atrasadas ?? 0
      }))
      .filter(d => d.saldoDevedor > 0)
      .sort((a, b) => b.saldoDevedor - a.saldoDevedor)
  }

  // --- Cálculos de agregação ---

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const somaValor = (items: any[], campo: string): number => {
    return items.reduce((sum, item) => sum + Number(item[campo] ?? 0), 0)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const agruparPorStatus = (items: any[], statusField: string, valorField: string): StatusItem[] => {
    const map = new Map<string, { count: number, valor: number }>()
    for (const item of items) {
      const status = item[statusField] as string
      const entry = map.get(status) ?? { count: 0, valor: 0 }
      entry.count++
      entry.valor += Number(item[valorField] ?? 0)
      map.set(status, entry)
    }
    return [...map.entries()].map(([status, data]) => ({ status, ...data }))
  }

  const calcularEvolucaoMensal = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    emprestimos: any[],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vales: any[],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    parcelasPagas: any[],
    inicio: string,
    fim: string
  ): EvolucaoMensal => {
    const d1 = new Date(inicio)
    const d2 = new Date(fim)
    const labels: string[] = []
    const empMap = new Map<string, number>()
    const valeMap = new Map<string, number>()
    const recMap = new Map<string, number>()

    // Gerar labels de meses
    const cur = new Date(d1.getFullYear(), d1.getMonth(), 1)
    while (cur <= d2) {
      const key = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, '0')}`
      labels.push(key)
      empMap.set(key, 0)
      valeMap.set(key, 0)
      recMap.set(key, 0)
      cur.setMonth(cur.getMonth() + 1)
    }

    // Agregar empréstimos por mês
    for (const e of emprestimos) {
      const date = e.data_solicitacao?.substring(0, 7)
      if (date && empMap.has(date)) {
        empMap.set(date, (empMap.get(date) ?? 0) + Number(e.valor_total))
      }
    }

    // Agregar vales por mês
    for (const v of vales) {
      const date = v.created_at?.substring(0, 7)
      if (date && valeMap.has(date)) {
        valeMap.set(date, (valeMap.get(date) ?? 0) + Number(v.valor))
      }
    }

    // Agregar recebimentos por mês
    for (const p of parcelasPagas) {
      const date = p.data_pagamento?.substring(0, 7) ?? p.data_prevista?.substring(0, 7)
      if (date && recMap.has(date)) {
        recMap.set(date, (recMap.get(date) ?? 0) + Number(p.valor))
      }
    }

    return {
      labels: labels.map((l) => {
        const [, m] = l.split('-')
        return MESES_PT[parseInt(m!, 10) - 1]!
      }),
      emprestimos: labels.map(l => empMap.get(l) ?? 0),
      vales: labels.map(l => valeMap.get(l) ?? 0),
      recebimentos: labels.map(l => recMap.get(l) ?? 0)
    }
  }

  const calcularPorUnidade = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    emprestimos: any[],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vales: any[],
    saldoData: TopDevedor[],
    unidades: { id: number, nome: string }[]
  ): UnidadeMetrica[] => {
    const map = new Map<string, UnidadeMetrica>()

    for (const u of unidades) {
      map.set(String(u.id), { unidade: u.nome, emprestimos: 0, vales: 0, saldoDevedor: 0 })
    }

    for (const e of emprestimos) {
      const uid = String(e.funcionario?.unidade_id)
      const entry = map.get(uid)
      if (entry) entry.emprestimos += Number(e.valor_total)
    }

    for (const v of vales) {
      const uid = String(v.funcionario?.unidade_id)
      const entry = map.get(uid)
      if (entry) entry.vales += Number(v.valor)
    }

    // Saldo devedor por unidade
    for (const d of saldoData) {
      for (const [, entry] of map) {
        if (entry.unidade === d.unidade) {
          entry.saldoDevedor += d.saldoDevedor
        }
      }
    }

    return [...map.values()].filter(u => u.emprestimos > 0 || u.vales > 0 || u.saldoDevedor > 0)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const calcularVencimentos = (parcelasPendentes: any[]): VencimentosFaixa => {
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)
    const em7 = new Date(hoje)
    em7.setDate(em7.getDate() + 7)
    const em30 = new Date(hoje)
    em30.setDate(em30.getDate() + 30)

    const result: VencimentosFaixa = { emDia: 0, vence7dias: 0, vence30dias: 0, atrasadas: 0 }

    for (const p of parcelasPendentes) {
      const venc = new Date(p.data_prevista)
      if (venc < hoje) {
        result.atrasadas++
      } else if (venc <= em7) {
        result.vence7dias++
      } else if (venc <= em30) {
        result.vence30dias++
      } else {
        result.emDia++
      }
    }

    return result
  }

  return {
    filtros,
    dados,
    carregando,
    carregar,
    atualizarPeriodo
  }
}
