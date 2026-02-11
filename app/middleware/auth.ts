export default defineNuxtRouteMiddleware((to) => {
  const { logado } = useAuth()

  if (!logado.value && to.path !== '/login') {
    return navigateTo('/login')
  }

  if (logado.value && to.path === '/login') {
    return navigateTo('/')
  }
})
