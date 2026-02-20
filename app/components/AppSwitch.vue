<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean
}>()

defineEmits<{
  'update:modelValue': [value: boolean]
}>()
</script>

<template>
  <button
    type="button"
    class="app-switch"
    :class="modelValue ? 'app-switch-on' : 'app-switch-off'"
    role="switch"
    :aria-checked="modelValue"
    @click="$emit('update:modelValue', !props.modelValue)"
  >
    <span class="app-switch-thumb" />
  </button>
</template>
