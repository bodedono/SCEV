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

  return {
    funcionarios,
    carregando,
    listar,
    buscarPorId,
    buscarComSaldo,
    criar,
    atualizar,
    desativar
  }
}
