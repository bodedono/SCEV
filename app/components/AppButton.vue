<script setup lang="ts">
const props = withDefaults(defineProps<{
  icon?: string
  variant?: 'solid' | 'outline' | 'ghost' | 'soft'
  color?: 'primary' | 'neutral' | 'error' | 'success' | 'warning'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  loading?: boolean
  disabled?: boolean
  to?: string
  block?: boolean
  type?: 'button' | 'submit' | 'reset'
  trailing?: boolean
  padded?: boolean
}>(), {
  variant: 'solid',
  color: 'primary',
  size: 'md',
  type: 'button',
  padded: true
})

const slots = useSlots()

const classes = computed(() => {
  const c = ['app-btn']
  c.push(`app-btn-${props.size}`)
  c.push(`app-btn-${props.variant}-${props.color}`)
  if (props.block) c.push('app-btn-block')
  if (!props.padded) c.push('!p-0')
  if (props.icon && !slots.default) c.push('!px-2')
  return c
})

const isDisabled = computed(() => props.disabled || props.loading)
</script>

<template>
  <NuxtLink
    v-if="to && !isDisabled"
    :to="to"
    :class="classes"
  >
    <AppIcon
      v-if="icon && !trailing"
      :name="icon"
      class="text-[1.1em]"
    />
    <span v-if="$slots.default"><slot /></span>
    <AppIcon
      v-if="icon && trailing"
      :name="icon"
      class="text-[1.1em]"
    />
  </NuxtLink>
  <button
    v-else
    :type="type"
    :disabled="isDisabled"
    :class="classes"
    v-bind="$attrs"
  >
    <AppIcon
      v-if="loading"
      name="i-lucide-loader-2"
      class="animate-spin text-[1.1em]"
    />
    <AppIcon
      v-else-if="icon && !trailing"
      :name="icon"
      class="text-[1.1em]"
    />
    <span v-if="$slots.default"><slot /></span>
    <AppIcon
      v-if="icon && trailing && !loading"
      :name="icon"
      class="text-[1.1em]"
    />
  </button>
</template>
