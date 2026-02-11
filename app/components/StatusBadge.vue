<script setup lang="ts">
const props = defineProps<{
  status: string
}>()

const { statusLabel, statusColor } = useFormatters()
</script>

<template>
  <UBadge :color="statusColor(props.status) as any" variant="subtle" size="sm">
    {{ statusLabel(props.status) }}
  </UBadge>
</template>
