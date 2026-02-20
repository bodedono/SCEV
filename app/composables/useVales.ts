import type { Vale, FormaDesconto } from '~/types'

export const useVales = () => {
  const supabase = useSupabaseClient()
  const { usuario, isAdmin } = useAuth()
  const vales = ref<Vale[]>([])
  const carregando = ref(false)

  const listar = async (filtros?: { funcionario_id?: number, unidade_id?: number, status?: string }) => {
    carregando.value = true
    try {
      let query = supabase
        .from('vales')
        .select(`
          *,
          funcionario:funcionarios(id, nome, matricula, unidade_id, unidade:unidades(id, nome)),
          usuario_cadastro:usuarios!vales_usuario_cadastro_id_fkey(id, nome),
          usuario_aprovacao:usuarios!vales_usuario_aprovacao_id_fkey(id, nome)
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
      vales.value = data as Vale[]
    } finally {
      carregando.value = false
    }
  }

  const buscarPorId = async (id: number) => {
    const { data, error } = await supabase
      .from('vales')
      .select(`
        *,
        funcionario:funcionarios(id, nome, matricula, unidade_id, unidade:unidades(id, nome)),
        parcelas(*)
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data as Vale
  }

  const criar = async (dados: {
    funcionario_id: number
    valor: number
    comentario: string
    referencia?: string
    data_ocorrido: string
    forma_desconto: FormaDesconto
    num_parcelas?: number
  }) => {
    const numParcelas = dados.forma_desconto === 'INTEGRAL' ? 1 : (dados.num_parcelas ?? 1)
    const status = isAdmin.value ? 'PENDENTE' : 'PENDENTE_APROVACAO'

    const { data, error } = await supabase
      .from('vales')
      .insert({
        ...dados,
        num_parcelas: numParcelas,
        status,
        usuario_cadastro_id: usuario.value!.id,
        usuario_aprovacao_id: isAdmin.value ? usuario.value!.id : null
      })
      .select()
      .single()

    if (error) throw error

    // Se Admin, gerar parcelas automaticamente
    if (isAdmin.value && data) {
      await supabase.rpc('gerar_parcelas_vale', { p_vale_id: data.id })
    }

    return data as Vale
  }

  const aprovar = async (id: number) => {
    const { error } = await supabase
      .from('vales')
      .update({
        status: 'PENDENTE',
        usuario_aprovacao_id: usuario.value!.id
      })
      .eq('id', id)

    if (error) throw error

    // Gerar parcelas
    await supabase.rpc('gerar_parcelas_vale', { p_vale_id: id })
  }

  const rejeitar = async (id: number) => {
    const { error } = await supabase
      .from('vales')
      .update({
        status: 'REJEITADO',
        usuario_aprovacao_id: usuario.value!.id
      })
      .eq('id', id)

    if (error) throw error
  }

  const cancelar = async (id: number) => {
    const { error } = await supabase
      .from('vales')
      .update({ status: 'CANCELADO' })
      .eq('id', id)

    if (error) throw error
  }

  const atualizar = async (id: number, dados: {
    valor?: number
    comentario?: string
    referencia?: string | null
    data_ocorrido?: string
    forma_desconto?: FormaDesconto
    num_parcelas?: number
  }) => {
    const { data, error } = await supabase
      .from('vales')
      .update(dados)
      .eq('id', id)
      .select(`
        *,
        funcionario:funcionarios(id, nome, matricula, unidade_id, unidade:unidades(id, nome)),
        usuario_cadastro:usuarios!vales_usuario_cadastro_id_fkey(id, nome),
        usuario_aprovacao:usuarios!vales_usuario_aprovacao_id_fkey(id, nome)
      `)
      .single()

    if (error) throw error
    return data as Vale
  }

  const excluir = async (id: number) => {
    // Deletar parcelas primeiro (FK constraint)
    const { error: parcelasError } = await supabase
      .from('parcelas')
      .delete()
      .eq('vale_id', id)
    if (parcelasError) throw parcelasError

    const { error } = await supabase
      .from('vales')
      .delete()
      .eq('id', id)
    if (error) throw error
  }

  return {
    vales,
    carregando,
    listar,
    buscarPorId,
    criar,
    aprovar,
    rejeitar,
    cancelar,
    atualizar,
    excluir
  }
}
