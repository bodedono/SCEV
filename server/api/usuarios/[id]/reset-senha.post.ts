import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  await verificarAdmin(event)

  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, message: 'ID do usuário é obrigatório' })
  }

  const body = await readBody(event)
  const { nova_senha } = body

  if (!nova_senha || nova_senha.length < 6) {
    throw createError({ statusCode: 400, message: 'Nova senha deve ter no mínimo 6 caracteres' })
  }

  const supabase = serverSupabaseServiceRole(event)

  const { error } = await supabase.auth.admin.updateUserById(id, {
    password: nova_senha
  })

  if (error) {
    throw createError({
      statusCode: 500,
      message: `Erro ao redefinir senha: ${error.message}`
    })
  }

  return { success: true }
})
