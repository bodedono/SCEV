import type { Usuario } from '~/types'

export const useAuth = () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()
  const usuario = useState<Usuario | null>('auth-usuario', () => null)
  const carregando = ref(false)
  const perfilCarregado = useState<boolean>('auth-perfil-carregado', () => false)

  // useSupabaseUser() retorna o payload JWT onde o ID fica em "sub"
  const userId = computed(() => {
    const u = user.value as { id?: string, sub?: string } | null
    return u?.id ?? u?.sub ?? null
  })

  const logado = computed(() => !!user.value)
  const perfil = computed(() => usuario.value?.perfil ?? null)
  const unidadeId = computed(() => usuario.value?.unidade_id ?? null)

  const isAdmin = computed(() => perfil.value === 'ADMIN')
  const isGestor = computed(() => perfil.value === 'GESTOR')
  const isOperador = computed(() => perfil.value === 'OPERADOR')

  const podeCadastrar = computed(() => isAdmin.value || isGestor.value)
  const podeAprovar = computed(() => isAdmin.value)
  const podeDarBaixa = computed(() => isAdmin.value)

  const carregarPerfil = async () => {
    if (!userId.value) {
      usuario.value = null
      perfilCarregado.value = true
      return
    }

    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*, unidade:unidades(id, nome)')
        .eq('id', userId.value)
        .single()

      if (error) {
        console.error('[useAuth] Erro ao carregar perfil:', error.message)
        usuario.value = null
      } else {
        usuario.value = data as Usuario | null
      }
    } catch (e) {
      console.error('[useAuth] Exceção ao carregar perfil:', e)
      usuario.value = null
    } finally {
      perfilCarregado.value = true
    }
  }

  const login = async (email: string, senha: string) => {
    carregando.value = true
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: senha
      })
      if (error) throw error
      await carregarPerfil()
    } finally {
      carregando.value = false
    }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    usuario.value = null
    perfilCarregado.value = false
    navigateTo('/login')
  }

  // Carregar perfil quando user muda
  watch(userId, async (newId, oldId) => {
    if (newId && newId !== oldId) {
      await carregarPerfil()
    } else if (!newId) {
      usuario.value = null
      perfilCarregado.value = true
    }
  }, { immediate: true })

  return {
    usuario,
    userId,
    carregando,
    perfilCarregado,
    logado,
    perfil,
    unidadeId,
    isAdmin,
    isGestor,
    isOperador,
    podeCadastrar,
    podeAprovar,
    podeDarBaixa,
    login,
    logout,
    carregarPerfil
  }
}
