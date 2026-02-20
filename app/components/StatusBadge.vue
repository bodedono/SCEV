<script setup lang="ts">
const props = defineProps<{
  status: string
}>()

const { statusLabel, statusColor } = useFormatters()
</script>

<template>
  <AppBadge
    :color="statusColor(props.status)"
    variant="subtle"
    size="sm"
  >
    {{ statusLabel(props.status) }}
  </AppBadge>
</template>
