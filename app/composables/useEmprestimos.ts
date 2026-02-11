import type { Emprestimo } from '~/types'

export const useEmprestimos = () => {
  const supabase = useSupabaseClient()
  const { usuario, isAdmin } = useAuth()
  const emprestimos = ref<Emprestimo[]>([])
  const carregando = ref(false)

  const listar = async (filtros?: { funcionario_id?: number, unidade_id?: number, status?: string }) => {
    carregando.value = true
    try {
      let query = supabase
        .from('emprestimos')
        .select(`
          *,
          funcionario:funcionarios(id, nome, matricula, unidade_id, unidade:unidades(id, nome)),
          usuario_cadastro:usuarios!emprestimos_usuario_cadastro_id_fkey(id, nome),
          usuario_aprovacao:usuarios!emprestimos_usuario_aprovacao_id_fkey(id, nome)
        `)
        .order('created_at', { ascending: false })

      if (filtros?.funcionario_id) {
        query = query.eq('funcionario_id', filtros.funcionario_id)
      }
      if (filtros?.status) {
        query = query.eq('status', filtros.status)
      }

      const { data, error } = await query
      if (error) throw error
      emprestimos.value = data as Emprestimo[]
    } finally {
      carregando.value = false
    }
  }

  const buscarPorId = async (id: number) => {
    const { data, error } = await supabase
      .from('emprestimos')
      .select(`
        *,
        funcionario:funcionarios(id, nome, matricula, unidade_id, unidade:unidades(id, nome)),
        parcelas(*)
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data as Emprestimo
  }

  const criar = async (dados: {
    funcionario_id: number
    valor_total: number
    num_parcelas: number
    data_inicio_desconto: string
    motivo: string
  }) => {
    const valorParcela = Math.round((dados.valor_total / dados.num_parcelas) * 100) / 100
    const status = isAdmin.value ? 'ATIVO' : 'PENDENTE_APROVACAO'

    const { data, error } = await supabase
      .from('emprestimos')
      .insert({
        ...dados,
        valor_parcela: valorParcela,
        status,
        usuario_cadastro_id: usuario.value!.id,
        usuario_aprovacao_id: isAdmin.value ? usuario.value!.id : null
      })
      .select()
      .single()

    if (error) throw error

    // Se Admin, gerar parcelas automaticamente
    if (isAdmin.value && data) {
      await supabase.rpc('gerar_parcelas_emprestimo', { p_emprestimo_id: data.id })
    }

    return data as Emprestimo
  }

  const aprovar = async (id: number) => {
    const { error } = await supabase
      .from('emprestimos')
      .update({
        status: 'ATIVO',
        usuario_aprovacao_id: usuario.value!.id
      })
      .eq('id', id)

    if (error) throw error

    // Gerar parcelas
    await supabase.rpc('gerar_parcelas_emprestimo', { p_emprestimo_id: id })
  }

  const rejeitar = async (id: number) => {
    const { error } = await supabase
      .from('emprestimos')
      .update({
        status: 'REJEITADO',
        usuario_aprovacao_id: usuario.value!.id
      })
      .eq('id', id)

    if (error) throw error
  }

  const cancelar = async (id: number) => {
    const { error } = await supabase
      .from('emprestimos')
      .update({ status: 'CANCELADO' })
      .eq('id', id)

    if (error) throw error
  }

  return {
    emprestimos,
    carregando,
    listar,
    buscarPorId,
    criar,
    aprovar,
    rejeitar,
    cancelar
  }
}
