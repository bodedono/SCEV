import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  await verificarAdmin(event)

  const body = await readBody(event)
  const { nome, email, cpf, senha, perfil, unidade_id, auto_confirmar, telefone, data_nascimento } = body

  if (!nome?.trim()) {
    throw createError({ statusCode: 400, message: 'Nome é obrigatório' })
  }
  if (!email?.trim()) {
    throw createError({ statusCode: 400, message: 'Email é obrigatório' })
  }
  if (!senha || senha.length < 6) {
    throw createError({ statusCode: 400, message: 'Senha deve ter no mínimo 6 caracteres' })
  }
  if (!['ADMIN', 'GESTOR', 'OPERADOR'].includes(perfil)) {
    throw createError({ statusCode: 400, message: 'Perfil inválido' })
  }

  // Validar CPF se fornecido
  if (cpf) {
    const cpfLimpo = cpf.replace(/\D/g, '')
    if (cpfLimpo.length !== 11) {
      throw createError({ statusCode: 400, message: 'CPF deve ter 11 dígitos' })
    }
  }

  const supabase = serverSupabaseServiceRole(event)

  // Criar no Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: email.trim(),
    password: senha,
    email_confirm: auto_confirmar ?? true
  })

  if (authError) {
    throw createError({
      statusCode: 400,
      message: `Erro ao criar usuário: ${authError.message}`
    })
  }

  // Inserir na tabela usuarios
  const { data: usuario, error: dbError } = await supabase
    .from('usuarios')
    .insert({
      id: authData.user.id,
      nome: nome.trim(),
      email: email.trim(),
      cpf: cpf ? cpf.replace(/\D/g, '') : null,
      telefone: telefone?.trim() || null,
      data_nascimento: data_nascimento || null,
      perfil,
      unidade_id: unidade_id || null,
      ativo: true
    })
    .select('*, unidade:unidades(id, nome)')
    .single()

  if (dbError) {
    // Rollback: deletar o auth user se o insert falhar
    await supabase.auth.admin.deleteUser(authData.user.id)
    throw createError({
      statusCode: 500,
      message: `Erro ao salvar dados do usuário: ${dbError.message}`
    })
  }

  return usuario
})
