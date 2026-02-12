export const useToastFeedback = () => {
  const toast = useToast()

  const sucesso = (title: string, description?: string) => {
    toast.add({ title, description, color: 'success' })
  }

  const erro = (title: string, error?: any) => {
    const description = error?.data?.message || error?.message || 'Erro desconhecido'
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
    } catch (e: any) {
      erro(mensagemErro, e)
      return null
    }
  }

  return { sucesso, erro, aviso, comFeedback }
}
