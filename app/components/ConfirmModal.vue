<script setup lang="ts">
defineProps<{
  title: string
  message: string
  detail?: string
  confirmLabel?: string
  confirmIcon?: string
  destructive?: boolean
}>()

const model = defineModel<boolean>({ default: false })

defineEmits<{
  confirm: []
}>()
</script>

<template>
  <AppModal
    v-model:open="model"
    :title="title"
    :destructive="destructive"
  >
    <div class="space-y-3">
      <p>{{ message }}</p>
      <p
        v-if="detail"
        class="text-sm text-gray-500 dark:text-gray-400"
      >
        {{ detail }}
      </p>
    </div>

    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton
          variant="outline"
          color="neutral"
          @click="model = false"
        >
          Cancelar
        </UButton>
        <UButton
          :color="destructive ? 'error' : 'primary'"
          :variant="destructive ? 'soft' : 'solid'"
          :icon="confirmIcon"
          @click="$emit('confirm'); model = false"
        >
          {{ confirmLabel ?? 'Confirmar' }}
        </UButton>
      </div>
    </template>
  </AppModal>
</template>
