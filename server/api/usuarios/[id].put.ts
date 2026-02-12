import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  await verificarAdmin(event)

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: 'ID do usuário é obrigatório' })
  }

  const body = await readBody(event)
  const { nome, email, perfil, unidade_id, ativo } = body

  if (perfil && !['ADMIN', 'GESTOR', 'OPERADOR'].includes(perfil)) {
    throw createError({ statusCode: 400, message: 'Perfil inválido' })
  }

  const supabase = serverSupabaseServiceRole(event)

  // Se email mudou, atualizar no auth tambem
  if (email) {
    const { error: authError } = await supabase.auth.admin.updateUserById(id, {
      email: email.trim()
    })
    if (authError) {
      throw createError({
        statusCode: 400,
        message: `Erro ao atualizar email: ${authError.message}`
      })
    }
  }

  // Montar objeto de update (apenas campos fornecidos)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateData: Record<string, any> = {}
  if (nome !== undefined) updateData.nome = nome.trim()
  if (email !== undefined) updateData.email = email.trim()
  if (perfil !== undefined) updateData.perfil = perfil
  if (unidade_id !== undefined) updateData.unidade_id = unidade_id || null
  if (ativo !== undefined) updateData.ativo = ativo

  const { data: usuario, error: dbError } = await supabase
    .from('usuarios')
    .update(updateData)
    .eq('id', id)
    .select('*, unidade:unidades(id, nome)')
    .single()

  if (dbError) {
    throw createError({
      statusCode: 500,
      message: `Erro ao atualizar usuário: ${dbError.message}`
    })
  }

  return usuario
})
