import type { MensagemChat } from '~/types'

const BOAS_VINDAS: MensagemChat = {
  id: 'welcome',
  role: 'assistant',
  content: 'Olá! 👋 Sou o assistente do SCEV. Posso te ajudar com dúvidas sobre empréstimos, vales, parcelas, fluxos de aprovação e muito mais. Como posso te ajudar?',
  timestamp: new Date()
}

export const useChatbot = () => {
  const { perfil } = useAuth()

  const mensagens = useState<MensagemChat[]>('chat-mensagens', () => [BOAS_VINDAS])
  const aberto = useState<boolean>('chat-aberto', () => false)
  const enviando = ref(false)

  const toggle = () => {
    aberto.value = !aberto.value
  }

  const enviarMensagem = async (texto: string) => {
    if (!texto.trim() || enviando.value) return

    const userMsg: MensagemChat = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: texto.trim(),
      timestamp: new Date()
    }
    mensagens.value.push(userMsg)

    enviando.value = true
    try {
      const historico = mensagens.value
        .filter(m => m.id !== 'welcome')
        .map(m => ({ role: m.role, content: m.content }))

      const { resposta } = await $fetch<{ resposta: string }>('/api/chat', {
        method: 'POST',
        body: {
          mensagens: historico,
          perfil: perfil.value ?? 'OPERADOR'
        }
      })

      const assistantMsg: MensagemChat = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: resposta,
        timestamp: new Date()
      }
      mensagens.value.push(assistantMsg)
    } catch {
      const errorMsg: MensagemChat = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Desculpe, houve um erro ao processar sua mensagem. Tente novamente.',
        timestamp: new Date()
      }
      mensagens.value.push(errorMsg)
    } finally {
      enviando.value = false
    }
  }

  const limparConversa = () => {
    mensagens.value = [{
      ...BOAS_VINDAS,
      id: `welcome-${Date.now()}`,
      timestamp: new Date()
    }]
  }

  return {
    mensagens,
    aberto,
    enviando,
    toggle,
    enviarMensagem,
    limparConversa
  }
}
