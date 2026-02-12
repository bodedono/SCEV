<script setup lang="ts">
interface Tab {
  label: string
  value: string
  icon?: string
  badge?: string | number
}

defineProps<{
  modelValue: string
  tabs: Tab[]
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <div class="flex gap-1 p-1 rounded-lg bg-gray-100 dark:bg-gray-800/50 w-fit mb-6">
    <UButton
      v-for="t in tabs"
      :key="t.value"
      :icon="t.icon"
      :variant="modelValue === t.value ? 'solid' : 'ghost'"
      :color="modelValue === t.value ? 'primary' : 'neutral'"
      size="sm"
      @click="$emit('update:modelValue', t.value)"
    >
      {{ t.label }}
      <UBadge
        v-if="t.badge"
        size="xs"
        variant="subtle"
        class="ml-1"
      >
        {{ t.badge }}
      </UBadge>
    </UButton>
  </div>
</template>
