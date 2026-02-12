<script setup lang="ts">
defineProps<{
  titulo: string
  descricao?: string
}>()
</script>

<template>
  <div class="flex items-center justify-between mb-6">
    <div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
        {{ titulo }}
      </h1>
      <p
        v-if="descricao"
        class="mt-1 text-sm text-gray-500"
      >
        {{ descricao }}
      </p>
    </div>
    <div class="flex items-center gap-2">
      <slot name="acoes" />
    </div>
  </div>
</template>
