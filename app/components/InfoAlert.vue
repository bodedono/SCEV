<script setup lang="ts">
withDefaults(defineProps<{
  message: string
  color?: 'yellow' | 'blue' | 'red' | 'green'
  icon?: string
}>(), {
  color: 'blue',
  icon: 'i-lucide-info'
})

const colorMap = {
  yellow: 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-400',
  blue: 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400',
  red: 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400',
  green: 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800 text-green-600 dark:text-green-400'
}
</script>

<template>
  <div class="mb-6 p-4 rounded-lg border" :class="colorMap[color]">
    <div class="flex items-center gap-2">
      <UIcon :name="icon" class="shrink-0" />
      <p class="text-sm">{{ message }}</p>
    </div>
  </div>
</template>
