import type { Funcionario } from '~/types'

export const useFuncionarios = () => {
  const supabase = useSupabaseClient()
  const funcionarios = ref<Funcionario[]>([])
  const carregando = ref(false)

  const listar = async (unidadeId?: number) => {
    carregando.value = true
    try {
      let query = supabase
        .from('funcionarios')
        .select('*, unidade:unidades(id, nome)')
        .order('nome')

      if (unidadeId) {
        query = query.eq('unidade_id', unidadeId)
      }

      const { data, error } = await query
      if (error) throw error
      funcionarios.value = data as Funcionario[]
    } finally {
      carregando.value = false
    }
  }

  const buscarPorId = async (id: number) => {
    const { data, error } = await supabase
      .from('funcionarios')
      .select('*, unidade:unidades(id, nome)')
      .eq('id', id)
      .single()

    if (error) throw error
    return data as Funcionario
  }

  const buscarComSaldo = async (id: number) => {
    const funcionario = await buscarPorId(id)

    // Buscar saldo devedor via parcelas pendentes
    const { data: saldoData } = await supabase
      .from('vw_saldo_devedor')
      .select('saldo_devedor')
      .eq('funcionario_id', id)
      .single()

    funcionario.saldo_devedor = saldoData?.saldo_devedor ?? 0
    return funcionario
  }

  const criar = async (dados: Partial<Funcionario>) => {
    const { data, error } = await supabase
      .from('funcionarios')
      .insert(dados)
      .select()
      .single()

    if (error) throw error
    return data as Funcionario
  }

  const atualizar = async (id: number, dados: Partial<Funcionario>) => {
    const { data, error } = await supabase
      .from('funcionarios')
      .update(dados)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as Funcionario
  }

  const desativar = async (id: number) => {
    const { error } = await supabase
      .from('funcionarios')
      .update({ ativo: false })
      .eq('id', id)

    if (error) throw error
  }

  const excluir = async (id: number) => {
    // Deletar parcelas de empréstimos do funcionário
    const { data: emps } = await supabase
      .from('emprestimos')
      .select('id')
      .eq('funcionario_id', id)
    if (emps?.length) {
      const empIds = emps.map(e => e.id)
      const { error: pe } = await supabase
        .from('parcelas')
        .delete()
        .in('emprestimo_id', empIds)
      if (pe) throw pe
    }

    // Deletar empréstimos do funcionário
    const { error: empError } = await supabase
      .from('emprestimos')
      .delete()
      .eq('funcionario_id', id)
    if (empError) throw empError

    // Deletar parcelas de vales do funcionário
    const { data: vls } = await supabase
      .from('vales')
      .select('id')
      .eq('funcionario_id', id)
    if (vls?.length) {
      const valeIds = vls.map(v => v.id)
      const { error: pv } = await supabase
        .from('parcelas')
        .delete()
        .in('vale_id', valeIds)
      if (pv) throw pv
    }

    // Deletar vales do funcionário
    const { error: valeError } = await supabase
      .from('vales')
      .delete()
      .eq('funcionario_id', id)
    if (valeError) throw valeError

    // Finalmente deletar o funcionário
    const { error } = await supabase
      .from('funcionarios')
      .delete()
      .eq('id', id)
    if (error) throw error
  }

  return {
    funcionarios,
    carregando,
    listar,
    buscarPorId,
    buscarComSaldo,
    criar,
    atualizar,
    desativar,
    excluir
  }
}
