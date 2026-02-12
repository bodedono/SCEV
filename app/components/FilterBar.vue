<script setup lang="ts">
defineProps<{
  busca?: string
  filtro?: any
  searchPlaceholder?: string
  filterOptions?: { label: string; value: any }[]
  filterPlaceholder?: string
  showFilter?: boolean
}>()

defineEmits<{
  'update:busca': [value: string]
  'update:filtro': [value: any]
}>()
</script>

<template>
  <div class="flex flex-wrap items-center gap-3 mb-6">
    <UInput
      :model-value="busca"
      :placeholder="searchPlaceholder ?? 'Buscar...'"
      icon="i-lucide-search"
      class="flex-1 max-w-sm"
      @update:model-value="$emit('update:busca', $event)"
    />
    <USelect
      v-if="showFilter && filterOptions?.length"
      :model-value="filtro"
      :items="filterOptions"
      :placeholder="filterPlaceholder ?? 'Filtrar'"
      class="w-56"
      @update:model-value="$emit('update:filtro', $event)"
    />
    <slot name="extra" />
  </div>
</template>
