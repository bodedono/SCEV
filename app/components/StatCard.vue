<script setup lang="ts">
defineProps<{
  titulo: string
  valor: string | number
  icone: string
  cor?: string
  destaque?: boolean
  subtitulo?: string
}>()
</script>

<template>
  <div
    class="stat-card"
    :class="{ 'stat-card-destaque': destaque }"
  >
    <div class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-2.5">
        <div
          class="flex items-center justify-center w-9 h-9 rounded-lg"
          :class="cor ?? 'icon-box-info'"
        >
          <AppIcon
            :name="icone"
            class="text-lg"
          />
        </div>
        <span
          class="text-sm font-medium"
          style="color: var(--text-secondary);"
        >
          {{ titulo }}
        </span>
      </div>
      <div
        class="w-7 h-7 rounded-lg flex items-center justify-center"
        style="background-color: var(--bg-surface-hover);"
      >
        <AppIcon
          name="i-lucide-arrow-up-right"
          class="text-sm"
          style="color: var(--text-muted);"
        />
      </div>
    </div>
    <p
      class="text-3xl font-bold tracking-tight"
      style="color: var(--text-main);"
    >
      {{ valor }}
    </p>
    <p
      v-if="subtitulo"
      class="text-xs mt-2.5"
      style="color: var(--text-muted);"
    >
      {{ subtitulo }}
    </p>
  </div>
</template>
