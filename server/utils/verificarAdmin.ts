import type { H3Event } from 'h3'
import { serverSupabaseUser, serverSupabaseServiceRole } from '#supabase/server'

export const verificarAdmin = async (event: H3Event) => {
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({ statusCode: 401, message: 'Não autorizado' })
  }

  const userId = user.sub || user.id
  if (!userId) {
    throw createError({ statusCode: 401, message: 'Não foi possível identificar o usuário' })
  }

  const supabase = serverSupabaseServiceRole(event)
  const { data: usuario } = await supabase
    .from('usuarios')
    .select('perfil')
    .eq('id', userId)
    .single()

  if (!usuario || usuario.perfil !== 'ADMIN') {
    throw createError({ statusCode: 403, message: 'Acesso restrito a administradores' })
  }

  return user
}
