<script setup lang="ts">
withDefaults(defineProps<{
  modelValue?: string
  placeholder?: string
  rows?: number
}>(), {
  rows: 3
})

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <textarea
    class="app-textarea"
    :value="modelValue"
    :placeholder="placeholder"
    :rows="rows"
    @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
  />
</template>
