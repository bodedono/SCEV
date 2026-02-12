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
  <UModal v-model:open="model">
    <template #header>
      <h3 class="text-lg font-semibold" :class="destructive ? 'text-red-600 dark:text-red-400' : ''">
        {{ title }}
      </h3>
    </template>
    <template #body>
      <div class="space-y-3">
        <p>{{ message }}</p>
        <p v-if="detail" class="text-sm text-gray-500 dark:text-gray-400">{{ detail }}</p>
      </div>
    </template>
    <template #footer>
      <div class="flex justify-end gap-2">
        <UButton variant="outline" color="neutral" @click="model = false">
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
  </UModal>
</template>
