import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const adminUser = await verificarAdmin(event)

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: 'ID do usuário é obrigatório' })
  }

  // Impedir auto-exclusao
  if (id === adminUser.id) {
    throw createError({ statusCode: 400, message: 'Você não pode excluir seu próprio usuário' })
  }

  const supabase = serverSupabaseServiceRole(event)

  // Verificar registros vinculados
  const { count: empCount } = await supabase
    .from('emprestimos')
    .select('id', { count: 'exact', head: true })
    .or(`usuario_cadastro_id.eq.${id},usuario_aprovacao_id.eq.${id}`)

  const { count: valeCount } = await supabase
    .from('vales')
    .select('id', { count: 'exact', head: true })
    .or(`usuario_cadastro_id.eq.${id},usuario_aprovacao_id.eq.${id}`)

  const { count: parcelaCount } = await supabase
    .from('parcelas')
    .select('id', { count: 'exact', head: true })
    .eq('usuario_baixa_id', id)

  const totalRelated = (empCount ?? 0) + (valeCount ?? 0) + (parcelaCount ?? 0)

  if (totalRelated > 0) {
    throw createError({
      statusCode: 409,
      message: `Este usuário possui ${totalRelated} registro(s) vinculado(s). Desative-o em vez de excluir.`
    })
  }

  // Deletar do auth.users (CASCADE deleta da tabela usuarios)
  const { error } = await supabase.auth.admin.deleteUser(id)
  if (error) {
    throw createError({
      statusCode: 500,
      message: `Erro ao excluir usuário: ${error.message}`
    })
  }

  return { success: true }
})
