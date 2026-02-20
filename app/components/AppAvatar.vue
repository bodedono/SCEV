<script setup lang="ts">
withDefaults(defineProps<{
  label: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
}>(), {
  size: 'md'
})
</script>

<template>
  <span
    class="app-avatar"
    :class="`app-avatar-${size}`"
  >
    {{ label }}
  </span>
</template>
