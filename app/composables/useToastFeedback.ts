export const useToastFeedback = () => {
  const toast = useToast()

  const sucesso = (title: string, description?: string) => {
    toast.add({ title, description, color: 'success' })
  }

  const erro = (title: string, error?: unknown) => {
    const err = error as Record<string, unknown> | undefined
    const data = err?.data as Record<string, unknown> | undefined
    const description = (data?.message as string) || (err?.message as string) || 'Erro desconhecido'
    toast.add({ title, description, color: 'error' })
  }

  const aviso = (title: string, description?: string) => {
    toast.add({ title, description, color: 'warning' })
  }

  const comFeedback = async <T>(
    action: () => Promise<T>,
    mensagemSucesso: string,
    mensagemErro: string = 'Erro ao processar'
  ): Promise<T | null> => {
    try {
      const result = await action()
      sucesso(mensagemSucesso)
      return result
    } catch (e: unknown) {
      erro(mensagemErro, e)
      return null
    }
  }

  return { sucesso, erro, aviso, comFeedback }
}
