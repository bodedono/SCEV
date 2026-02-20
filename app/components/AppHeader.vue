<script setup lang="ts">
const { usuario } = useAuth()

defineProps<{
  sidebarAberta: boolean
}>()

const emit = defineEmits<{
  'toggle-sidebar': []
}>()
</script>

<template>
  <header
    class="h-16 flex items-center rounded-2xl my-8 mx-4 gap-4 px-6 "
    style="background-color: var(--bg-surface); border-color: var(--border-subtle); box-shadow: var(--shadow-sm);"
  >
    <AppButton
      :icon="sidebarAberta ? 'i-lucide-panel-left-close' : 'i-lucide-panel-left-open'"
      variant="ghost"
      color="neutral"
      @click="emit('toggle-sidebar')"
    />

    <!-- Search -->
    <div class="header-search hidden md:flex">
      <AppIcon
        name="i-lucide-search"
        class="text-base"
      />
      <input
        type="text"
        placeholder="Pesquisar..."
        disabled
      >
      <kbd>Ctrl F</kbd>
    </div>

    <div class="flex-1" />

    <!-- Right side -->
    <AppColorModeToggle />

    <div
      class="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer"
      style="background-color: var(--bg-surface-hover);"
    >
      <AppIcon
        name="i-lucide-bell"
        class="text-base"
        style="color: var(--text-secondary);"
      />
    </div>

    <!-- User -->
    <div
      class="flex items-center gap-3 pl-3 border-l"
      style="border-color: var(--border-subtle);"
    >
      <AppAvatar
        :label="usuario?.nome?.charAt(0) ?? 'U'"
        size="sm"
      />
      <div
        v-if="usuario"
        class="hidden lg:block"
      >
        <p
          class="text-sm font-medium leading-tight"
          style="color: var(--text-main);"
        >
          {{ usuario.nome }}
        </p>
        <p
          class="text-xs leading-tight"
          style="color: var(--text-muted);"
        >
          {{ usuario.email }}
        </p>
      </div>
    </div>
  </header>
</template>
