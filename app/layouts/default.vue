<script setup lang="ts">
const { usuario, logout, isAdmin, isGestor } = useAuth()

const menuPrincipal = computed(() => {
  const items = [
    { label: 'Dashboard', icon: 'i-lucide-layout-dashboard', to: '/' },
    { label: 'Funcionários', icon: 'i-lucide-users', to: '/funcionarios' },
    { label: 'Empréstimos', icon: 'i-lucide-banknote', to: '/emprestimos' },
    { label: 'Vales', icon: 'i-lucide-receipt', to: '/vales' },
    { label: 'Parcelas', icon: 'i-lucide-calendar-check', to: '/parcelas' }
  ]

  if (isAdmin.value || isGestor.value) {
    items.push(
      { label: 'Analytics', icon: 'i-lucide-bar-chart-3', to: '/analytics' }
    )
  }

  if (isAdmin.value) {
    items.push(
      { label: 'Aprovações', icon: 'i-lucide-check-circle', to: '/aprovacoes' },
      { label: 'Configurações', icon: 'i-lucide-settings', to: '/configuracoes' }
    )
  }

  if (isGestor.value) {
    items.push(
      { label: 'Meus Lançamentos', icon: 'i-lucide-list', to: '/meus-lancamentos' }
    )
  }

  return items
})

const sidebarAberta = ref(true)
</script>

<template>
  <div class="min-h-screen flex bg-gray-50 dark:bg-gray-950">
    <!-- Sidebar -->
    <aside
      class="flex flex-col border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 transition-all duration-300"
      :class="sidebarAberta ? 'w-64' : 'w-16'"
    >
      <!-- Logo -->
      <div class="h-16 flex items-center px-4 border-b border-gray-200 dark:border-gray-800">
        <UIcon
          name="i-lucide-building-2"
          class="text-primary text-xl shrink-0"
        />
        <span
          v-if="sidebarAberta"
          class="ml-3 font-bold text-lg truncate"
        >SCEV</span>
      </div>

      <!-- Menu -->
      <nav class="flex-1 py-4 space-y-1 px-2 overflow-y-auto">
        <NuxtLink
          v-for="item in menuPrincipal"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          active-class="!bg-primary/10 !text-primary"
        >
          <UIcon
            :name="item.icon"
            class="text-lg shrink-0"
          />
          <span
            v-if="sidebarAberta"
            class="truncate"
          >{{ item.label }}</span>
        </NuxtLink>
      </nav>

      <!-- Usuário -->
      <div class="border-t border-gray-200 dark:border-gray-800 p-3">
        <div
          v-if="sidebarAberta"
          class="flex items-center gap-3"
        >
          <UAvatar
            :label="usuario?.nome?.charAt(0) ?? 'U'"
            size="sm"
          />
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium truncate">
              {{ usuario?.nome }}
            </p>
            <p class="text-xs text-gray-500 truncate">
              {{ usuario?.perfil }}
            </p>
          </div>
          <UButton
            icon="i-lucide-log-out"
            variant="ghost"
            color="neutral"
            size="xs"
            @click="logout"
          />
        </div>
        <UButton
          v-else
          icon="i-lucide-log-out"
          variant="ghost"
          color="neutral"
          size="xs"
          class="w-full"
          @click="logout"
        />
      </div>
    </aside>

    <!-- Conteúdo -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- Header -->
      <header class="h-16 flex items-center gap-4 px-6 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <UButton
          :icon="sidebarAberta ? 'i-lucide-panel-left-close' : 'i-lucide-panel-left-open'"
          variant="ghost"
          color="neutral"
          @click="sidebarAberta = !sidebarAberta"
        />
        <div class="flex-1" />
        <UColorModeButton />
      </header>

      <!-- Conteúdo da página -->
      <main class="flex-1 p-6 overflow-y-auto">
        <slot />
      </main>
    </div>

    <!-- Chat flutuante -->
    <ChatWidget />
  </div>
</template>
