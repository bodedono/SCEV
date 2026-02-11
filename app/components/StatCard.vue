<script setup lang="ts">
defineProps<{
  titulo: string
  valor: string | number
  icone: string
  cor?: string
  destaque?: boolean
}>()
</script>

<template>
  <div
    class="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5"
    :class="destaque ? 'ring-2 ring-red-500/50' : ''"
  >
    <div class="flex items-center gap-4">
      <div
        class="flex items-center justify-center w-12 h-12 rounded-lg"
        :class="cor ?? 'bg-primary/10 text-primary'"
      >
        <UIcon :name="icone" class="text-2xl" />
      </div>
      <div>
        <p class="text-sm font-medium text-gray-500">{{ titulo }}</p>
        <p class="text-2xl font-bold text-gray-900 dark:text-white">{{ valor }}</p>
      </div>
    </div>
  </div>
</template>
