<script setup lang="ts">
const props = defineProps<{
  title?: string
  icon?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  destructive?: boolean
}>()

const model = defineModel<boolean>('open', { default: false })

const sizeClass = computed(() => {
  const map: Record<string, string> = {
    sm: 'sm:max-w-sm',
    md: 'sm:max-w-lg',
    lg: 'sm:max-w-2xl',
    xl: 'sm:max-w-4xl'
  }
  return map[props.size ?? 'md']
})
</script>

<template>
  <UModal
    v-model:open="model"
    :ui="{ content: sizeClass }"
  >
    <template #header>
      <slot name="header">
        <div class="flex items-center gap-2">
          <UIcon
            v-if="icon"
            :name="icon"
            class="text-lg"
            :class="destructive ? 'text-red-500' : 'text-primary'"
          />
          <h3
            class="text-lg font-semibold"
            :class="destructive ? 'text-red-600 dark:text-red-400' : ''"
          >
            {{ title }}
          </h3>
        </div>
      </slot>
    </template>

    <template #body>
      <slot />
    </template>

    <template
      v-if="$slots.footer"
      #footer
    >
      <slot name="footer" />
    </template>
  </UModal>
</template>
