export const useModalState = <T = any>() => {
  const aberto = ref(false)
  const item = ref<T | null>(null) as Ref<T | null>

  const abrir = (selected?: T) => {
    item.value = selected ?? null
    aberto.value = true
  }

  const fechar = () => {
    aberto.value = false
    item.value = null
  }

  return { aberto, item, abrir, fechar }
}
