interface ToastItem {
  id: number
  title: string
  description?: string
  color: 'success' | 'error' | 'warning'
  leaving?: boolean
}

const toasts = ref<ToastItem[]>([])
let nextId = 0

export const useAppToast = () => {
  const add = (opts: { title: string, description?: string, color?: string }) => {
    const id = nextId++
    const color = (opts.color === 'success' || opts.color === 'error' || opts.color === 'warning')
      ? opts.color
      : 'success'

    toasts.value.push({
      id,
      title: opts.title,
      description: opts.description,
      color
    })

    // Auto-dismiss after 4s
    setTimeout(() => dismiss(id), 4000)
  }

  const dismiss = (id: number) => {
    const toast = toasts.value.find(t => t.id === id)
    if (toast) {
      toast.leaving = true
      setTimeout(() => {
        toasts.value = toasts.value.filter(t => t.id !== id)
      }, 200)
    }
  }

  return { toasts, add, dismiss }
}
