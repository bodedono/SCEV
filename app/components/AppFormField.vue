<script setup lang="ts">
defineProps<{
  label?: string
  required?: boolean
  error?: string
  hint?: string
}>()
</script>

<template>
  <div class="space-y-1">
    <div
      v-if="label || hint"
      class="app-form-label"
    >
      <span :class="required ? 'app-form-required' : ''">{{ label }}</span>
      <span
        v-if="hint"
        class="ml-auto text-xs font-normal"
        style="color: var(--text-muted);"
      >{{ hint }}</span>
    </div>
    <slot />
    <p
      v-if="error"
      class="app-form-error"
    >
      {{ error }}
    </p>
  </div>
</template>
