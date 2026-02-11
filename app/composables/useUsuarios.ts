import type { Usuario, UsuarioFormData, UsuarioUpdateData } from '~/types'

export const useUsuarios = () => {
  const supabase = useSupabaseClient()
  const usuarios = ref<Usuario[]>([])
  const carregando = ref(false)

  const listar = async () => {
    carregando.value = true
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*, unidade:unidades(id, nome)')
        .order('nome')

      if (error) throw error
      usuarios.value = data as Usuario[]
    } finally {
      carregando.value = false
    }
  }

  const criar = async (dados: UsuarioFormData): Promise<Usuario> => {
    return await $fetch<Usuario>('/api/usuarios', {
      method: 'POST',
      body: dados
    })
  }

  const atualizar = async (id: string, dados: UsuarioUpdateData): Promise<Usuario> => {
    return await $fetch<Usuario>(`/api/usuarios/${id}`, {
      method: 'PUT',
      body: dados
    })
  }

  const excluir = async (id: string): Promise<void> => {
    await $fetch(`/api/usuarios/${id}`, {
      method: 'DELETE'
    })
  }

  const desativar = async (id: string): Promise<Usuario> => {
    return await atualizar(id, { ativo: false })
  }

  const reativar = async (id: string): Promise<Usuario> => {
    return await atualizar(id, { ativo: true })
  }

  const resetarSenha = async (id: string, novaSenha: string): Promise<void> => {
    await $fetch(`/api/usuarios/${id}/reset-senha`, {
      method: 'POST',
      body: { nova_senha: novaSenha }
    })
  }

  return {
    usuarios,
    carregando,
    listar,
    criar,
    atualizar,
    excluir,
    desativar,
    reativar,
    resetarSenha
  }
}
