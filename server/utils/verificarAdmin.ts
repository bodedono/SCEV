import type { H3Event } from 'h3'
import { serverSupabaseUser, serverSupabaseServiceRole } from '#supabase/server'

export const verificarAdmin = async (event: H3Event) => {
  const user = await serverSupabaseUser(event)
  if (!user) {
    throw createError({ statusCode: 401, message: 'Não autorizado' })
  }

  const supabase = serverSupabaseServiceRole(event)
  const { data: usuario } = await supabase
    .from('usuarios')
    .select('perfil')
    .eq('id', user.id)
    .single()

  if (!usuario || usuario.perfil !== 'ADMIN') {
    throw createError({ statusCode: 403, message: 'Acesso restrito a administradores' })
  }

  return user
}
