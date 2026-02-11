export const useFormatters = () => {
  const moeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor)
  }

  const data = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR')
  }

  const dataHora = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('pt-BR')
  }

  const statusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PENDENTE_APROVACAO: 'Pendente Aprovação',
      ATIVO: 'Ativo',
      QUITADO: 'Quitado',
      CANCELADO: 'Cancelado',
      REJEITADO: 'Rejeitado',
      PENDENTE: 'Pendente',
      PAGA: 'Paga',
      ATRASADA: 'Atrasada',
      INTEGRAL: 'Integral',
      PARCELAS: 'Parcelas'
    }
    return labels[status] || status
  }

  const statusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDENTE_APROVACAO: 'warning',
      ATIVO: 'info',
      QUITADO: 'success',
      CANCELADO: 'neutral',
      REJEITADO: 'error',
      PENDENTE: 'warning',
      PAGA: 'success',
      ATRASADA: 'error'
    }
    return colors[status] || 'neutral'
  }

  return { moeda, data, dataHora, statusLabel, statusColor }
}
