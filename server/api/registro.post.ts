import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { nome, email, senha, cpf, telefone, data_nascimento } = body

  // Validações
  if (!nome?.trim()) {
    throw createError({ statusCode: 400, message: 'Nome é obrigatório' })
  }
  if (!email?.trim()) {
    throw createError({ statusCode: 400, message: 'Email é obrigatório' })
  }
  if (!senha || senha.length < 6) {
    throw createError({ statusCode: 400, message: 'Senha deve ter no mínimo 6 caracteres' })
  }
  if (cpf) {
    const cpfLimpo = cpf.replace(/\D/g, '')
    if (cpfLimpo.length !== 11) {
      throw createError({ statusCode: 400, message: 'CPF deve ter 11 dígitos' })
    }
  }

  const supabase = serverSupabaseServiceRole(event)

  // Criar auth user — email NÃO confirmado (precisa verificar)
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: email.trim(),
    password: senha,
    email_confirm: false
  })

  if (authError) {
    throw createError({
      statusCode: 400,
      message: `Erro ao criar conta: ${authError.message}`
    })
  }

  // Inserir na tabela usuarios com perfil OPERADOR
  const { error: dbError } = await supabase
    .from('usuarios')
    .insert({
      id: authData.user.id,
      nome: nome.trim(),
      email: email.trim(),
      cpf: cpf ? cpf.replace(/\D/g, '') : null,
      telefone: telefone?.trim() || null,
      data_nascimento: data_nascimento || null,
      perfil: 'OPERADOR',
      unidade_id: null,
      ativo: true
    })

  if (dbError) {
    // Rollback: deletar auth user
    await supabase.auth.admin.deleteUser(authData.user.id)
    throw createError({
      statusCode: 500,
      message: `Erro ao salvar dados: ${dbError.message}`
    })
  }

  // Gerar matrícula automática
  const cpfLimpo = cpf ? cpf.replace(/\D/g, '') : ''
  const sufixo = cpfLimpo ? cpfLimpo.slice(-4) : String(Date.now()).slice(-4)
  const matricula = `AUTO-${sufixo}-${Date.now().toString(36).toUpperCase()}`

  // Inserir na tabela funcionarios
  const { error: funcError } = await supabase
    .from('funcionarios')
    .insert({
      nome: nome.trim(),
      cpf: cpf ? cpf.replace(/\D/g, '') : null,
      telefone: telefone?.trim() || null,
      matricula,
      cargo: 'Funcionário',
      unidade_id: null,
      data_admissao: new Date().toISOString().split('T')[0],
      ativo: true,
      usuario_id: authData.user.id
    })

  if (funcError) {
    // Rollback: deletar usuario e auth user (cascade)
    await supabase.from('usuarios').delete().eq('id', authData.user.id)
    await supabase.auth.admin.deleteUser(authData.user.id)
    throw createError({
      statusCode: 500,
      message: `Erro ao criar registro de funcionário: ${funcError.message}`
    })
  }

  return { message: 'Conta criada com sucesso. Verifique seu email para ativar.' }
})
