import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { nome, email, senha } = body

  if (!nome?.trim()) {
    throw createError({ statusCode: 400, message: 'Nome é obrigatório' })
  }
  if (!email?.trim()) {
    throw createError({ statusCode: 400, message: 'Email é obrigatório' })
  }
  if (!senha || senha.length < 6) {
    throw createError({ statusCode: 400, message: 'Senha deve ter no mínimo 6 caracteres' })
  }

  const supabase = serverSupabaseServiceRole(event)

  // Verificar se ja existe algum admin (bloqueia se ja tiver)
  const { data: admins, error: checkError } = await supabase
    .from('usuarios')
    .select('id')
    .eq('perfil', 'ADMIN')
    .limit(1)

  if (checkError) {
    throw createError({
      statusCode: 500,
      message: `As tabelas ainda não existem. Execute os scripts SQL (001_schema.sql e 002_rls.sql) no Supabase Dashboard primeiro. Erro: ${checkError.message}`
    })
  }

  if (admins && admins.length > 0) {
    throw createError({
      statusCode: 409,
      message: 'Já existe um administrador cadastrado. Faça login normalmente.'
    })
  }

  // Criar no Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: email.trim(),
    password: senha,
    email_confirm: true
  })

  if (authError) {
    throw createError({
      statusCode: 400,
      message: `Erro ao criar usuário: ${authError.message}`
    })
  }

  // Inserir na tabela usuarios como ADMIN
  const { data: usuario, error: dbError } = await supabase
    .from('usuarios')
    .insert({
      id: authData.user.id,
      nome: nome.trim(),
      email: email.trim(),
      perfil: 'ADMIN',
      unidade_id: null,
      ativo: true
    })
    .select('*')
    .single()

  if (dbError) {
    // Rollback
    await supabase.auth.admin.deleteUser(authData.user.id)
    throw createError({
      statusCode: 500,
      message: `Erro ao salvar admin: ${dbError.message}`
    })
  }

  return { message: 'Administrador criado com sucesso!', usuario }
})
