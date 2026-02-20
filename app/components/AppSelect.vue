<script setup lang="ts">
defineProps<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  modelValue?: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  items: { label: string, value: any }[]
  placeholder?: string
  searchable?: boolean
}>()

const emit = defineEmits<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  'update:modelValue': [value: any]
}>()

const onChange = (e: Event) => {
  const target = e.target as HTMLSelectElement
  const val = target.value
  // Try to convert to number if it looks like one
  const num = Number(val)
  emit('update:modelValue', val === '' ? undefined : (!isNaN(num) && val !== '' ? num : val))
}
</script>

<template>
  <select
    class="app-select"
    :value="modelValue ?? ''"
    @change="onChange"
  >
    <option
      v-if="placeholder"
      value=""
      disabled
    >
      {{ placeholder }}
    </option>
    <option
      v-for="item in items"
      :key="String(item.value)"
      :value="item.value ?? ''"
    >
      {{ item.label }}
    </option>
  </select>
</template>
