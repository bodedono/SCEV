export default defineNuxtRouteMiddleware(async (to) => {
  const { perfil, perfilCarregado, carregarPerfil } = useAuth()

  if (!perfilCarregado.value) {
    await carregarPerfil()
  }

  const rotasAdmin = ['/configuracoes', '/aprovacoes']
  const rotasCadastro = ['/emprestimos/novo', '/vales/novo']

  if (rotasAdmin.some(r => to.path.startsWith(r)) && perfil.value !== 'ADMIN') {
    return navigateTo('/')
  }

  if (rotasCadastro.some(r => to.path.startsWith(r)) && perfil.value === 'OPERADOR') {
    return navigateTo('/')
  }
})
