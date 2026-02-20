<script setup lang="ts">
const { isAdmin, isGestor, logout } = useAuth()

defineProps<{
  aberta: boolean
}>()

const emit = defineEmits<{
  'update:aberta': [value: boolean]
}>()

const menuPrincipal = computed(() => [
  { label: 'Dashboard', icon: 'i-lucide-layout-dashboard', to: '/' },
  { label: 'Funcionários', icon: 'i-lucide-users', to: '/funcionarios' },
  { label: 'Empréstimos', icon: 'i-lucide-banknote', to: '/emprestimos' },
  { label: 'Vales', icon: 'i-lucide-receipt', to: '/vales' },
  { label: 'Parcelas', icon: 'i-lucide-calendar-check', to: '/parcelas' }
])

const menuGestao = computed(() => {
  const items: { label: string; icon: string; to: string }[] = []
  if (isAdmin.value || isGestor.value) {
    items.push({ label: 'Analytics', icon: 'i-lucide-bar-chart-3', to: '/analytics' })
  }
  if (isAdmin.value) {
    items.push({ label: 'Aprovações', icon: 'i-lucide-check-circle', to: '/aprovacoes' })
  }
  if (isGestor.value) {
    items.push({ label: 'Meus Lançamentos', icon: 'i-lucide-list', to: '/meus-lancamentos' })
  }
  return items
})

const menuGeral = computed(() => {
  const items: { label: string; icon: string; to: string }[] = []
  if (isAdmin.value) {
    items.push({ label: 'Configurações', icon: 'i-lucide-settings', to: '/configuracoes' })
  }
  return items
})
</script>

<template>
  <aside class="flex flex-col rounded-2xl my-8 ml-6 transition-all duration-300 shrink-0"
    style="background-color: var(--bg-surface); border-color: var(--border-subtle);" :class="aberta ? 'w-64' : 'w-16'">
    <!-- Logo -->
    <div class="h-16 flex items-center px-4 " style="border-color: var(--border-subtle);">
      <div class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
        style="background-color: var(--clr-primary); color: var(--clr-primary-fg);">
        <AppIcon name="i-lucide-building-2" class="text-lg" />
      </div>
      <span v-if="aberta" class="ml-3 font-semibold text-lg tracking-tight truncate" style="color: var(--text-main);">
        SCEV
      </span>
    </div>

    <!-- Menu -->
    <nav class="flex-1 py-3 px-2 overflow-y-auto">
      <!-- MENU section -->
      <p v-if="aberta" class="sidebar-section">
        Menu
      </p>
      <div class="space-y-0.5">
        <NuxtLink v-for="item in menuPrincipal" :key="item.to" :to="item.to"
          class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 nav-item"
          active-class="nav-item-active">
          <AppIcon :name="item.icon" class="text-lg shrink-0" />
          <span v-if="aberta" class="truncate">
            {{ item.label }}
          </span>
        </NuxtLink>
      </div>

      <!-- GESTÃO section -->
      <template v-if="menuGestao.length > 0">
        <p v-if="aberta" class="sidebar-section">
          Gestão
        </p>
        <div class="space-y-0.5">
          <NuxtLink v-for="item in menuGestao" :key="item.to" :to="item.to"
            class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 nav-item"
            active-class="nav-item-active">
            <AppIcon :name="item.icon" class="text-lg shrink-0" />
            <span v-if="aberta" class="truncate">
              {{ item.label }}
            </span>
          </NuxtLink>
        </div>
      </template>

      <!-- GERAL section -->
      <template v-if="menuGeral.length > 0">
        <p v-if="aberta" class="sidebar-section">
          Geral
        </p>
        <div class="space-y-0.5">
          <NuxtLink v-for="item in menuGeral" :key="item.to" :to="item.to"
            class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 nav-item"
            active-class="nav-item-active">
            <AppIcon :name="item.icon" class="text-lg shrink-0" />
            <span v-if="aberta" class="truncate">
              {{ item.label }}
            </span>
          </NuxtLink>
        </div>
      </template>
      <!-- Footer: Logout -->

      <button class="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer text-sm font-medium w-full nav-item"
        @click="logout">
        <AppIcon name="i-lucide-log-out" class="text-lg shrink-0" />
        <span v-if="aberta" class="truncate">
          Sair
        </span>
      </button>

    </nav>


  </aside>
</template>
