import type { Unidade } from '~/types'

export const useUnidades = () => {
  const supabase = useSupabaseClient()
  const unidades = ref<Unidade[]>([])

  const listar = async () => {
    const { data, error } = await supabase
      .from('unidades')
      .select('*')
      .eq('ativo', true)
      .order('nome')

    if (error) throw error
    unidades.value = data as Unidade[]
  }

  const criar = async (nome: string) => {
    const { data, error } = await supabase
      .from('unidades')
      .insert({ nome })
      .select()
      .single()

    if (error) throw error
    return data as Unidade
  }

  return { unidades, listar, criar }
}
