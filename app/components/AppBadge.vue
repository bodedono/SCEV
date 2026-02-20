<script setup lang="ts">
const props = withDefaults(defineProps<{
  color?: 'success' | 'error' | 'warning' | 'info' | 'neutral' | 'primary'
  variant?: 'subtle' | 'solid'
  size?: 'xs' | 'sm' | 'md'
}>(), {
  color: 'neutral',
  variant: 'subtle',
  size: 'sm'
})

const classes = computed(() => [
  'app-badge',
  `app-badge-${props.size}`,
  `app-badge-${props.variant}-${props.color}`
])
</script>

<template>
  <span :class="classes">
    <slot />
  </span>
</template>
