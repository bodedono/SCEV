import type { DashboardStats } from '~/types'

export const useDashboard = () => {
  const supabase = useSupabaseClient()
  const stats = ref<DashboardStats>({
    pendencias_aprovacao: 0,
    emprestimos_ativos: 0,
    vales_pendentes: 0,
    valor_total_receber: 0,
    parcelas_atrasadas: 0
  })
  const carregando = ref(false)

  const carregar = async () => {
    carregando.value = true
    try {
      // Pendências de aprovação
      const { count: pendEmp } = await supabase
        .from('emprestimos')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'PENDENTE_APROVACAO')

      const { count: pendVale } = await supabase
        .from('vales')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'PENDENTE_APROVACAO')

      // Empréstimos ativos
      const { count: empAtivos } = await supabase
        .from('emprestimos')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'ATIVO')

      // Vales pendentes
      const { count: valesPend } = await supabase
        .from('vales')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'PENDENTE')

      // Parcelas atrasadas (data_prevista < hoje e status PENDENTE)
      const hoje = new Date().toISOString().split('T')[0]
      const { count: atrasadas } = await supabase
        .from('parcelas')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'PENDENTE')
        .lt('data_prevista', hoje)

      // Valor total a receber
      const { data: totalData } = await supabase
        .from('parcelas')
        .select('valor')
        .in('status', ['PENDENTE', 'ATRASADA'])

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const valorTotal = (totalData ?? []).reduce((sum: number, p: any) => sum + Number(p.valor), 0)

      stats.value = {
        pendencias_aprovacao: (pendEmp ?? 0) + (pendVale ?? 0),
        emprestimos_ativos: empAtivos ?? 0,
        vales_pendentes: valesPend ?? 0,
        valor_total_receber: valorTotal,
        parcelas_atrasadas: atrasadas ?? 0
      }
    } finally {
      carregando.value = false
    }
  }

  return {
    stats,
    carregando,
    carregar
  }
}
