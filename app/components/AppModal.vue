<script setup lang="ts">
const props = withDefaults(defineProps<{
  title?: string
  icon?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  destructive?: boolean
}>(), {
  size: 'md'
})

const model = defineModel<boolean>('open', { default: false })

const sizeClass = computed(() => `app-modal-${props.size}`)

const onBackdropClick = (e: MouseEvent) => {
  if (e.target === e.currentTarget) {
    model.value = false
  }
}

const onEsc = (e: KeyboardEvent) => {
  if (e.key === 'Escape') model.value = false
}

onMounted(() => document.addEventListener('keydown', onEsc))
onUnmounted(() => document.removeEventListener('keydown', onEsc))
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="model"
        class="app-modal-backdrop"
        @click="onBackdropClick"
      >
        <div
          class="app-modal-content"
          :class="sizeClass"
          @click.stop
        >
          <!-- Header -->
          <div
            v-if="title || $slots.header"
            class="app-modal-header"
          >
            <slot name="header">
              <AppIcon
                v-if="icon"
                :name="icon"
                class="text-lg"
                :class="destructive ? 'text-red-500' : ''"
                :style="!destructive ? 'color: var(--clr-primary);' : ''"
              />
              <h3
                class="text-lg font-semibold"
                :class="destructive ? 'text-red-600 dark:text-red-400' : ''"
              >
                {{ title }}
              </h3>
            </slot>
          </div>

          <!-- Body -->
          <div class="app-modal-body">
            <slot />
          </div>

          <!-- Footer -->
          <div
            v-if="$slots.footer"
            class="app-modal-footer"
          >
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
