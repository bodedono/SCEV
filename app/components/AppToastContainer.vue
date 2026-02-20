<script setup lang="ts">
const { toasts, dismiss } = useAppToast()
</script>

<template>
  <Teleport to="body">
    <div class="app-toast-container">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="app-toast"
        :class="[
          `app-toast-${toast.color}`,
          toast.leaving ? 'app-toast-leaving' : ''
        ]"
        @click="dismiss(toast.id)"
      >
        <AppIcon
          :name="toast.color === 'success' ? 'i-lucide-check-circle' : toast.color === 'error' ? 'i-lucide-alert-circle' : 'i-lucide-alert-triangle'"
          class="text-lg shrink-0 mt-0.5"
          :style="`color: ${toast.color === 'success' ? '#4E8A5A' : toast.color === 'error' ? '#C0392B' : 'var(--clr-accent)'}`"
        />
        <div class="flex-1 min-w-0">
          <p
            class="text-sm font-medium"
            style="color: var(--text-main);"
          >
            {{ toast.title }}
          </p>
          <p
            v-if="toast.description"
            class="text-xs mt-0.5"
            style="color: var(--text-secondary);"
          >
            {{ toast.description }}
          </p>
        </div>
      </div>
    </div>
  </Teleport>
</template>
