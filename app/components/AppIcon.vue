<script setup lang="ts">
const props = defineProps<{
  name: string
}>()

const iconName = computed(() => {
  let n = props.name
  if (n.startsWith('i-')) n = n.slice(2)
  const idx = n.indexOf('-')
  if (idx > 0) return n.slice(0, idx) + ':' + n.slice(idx + 1)
  return n
})
</script>

<template>
  <Icon
    :name="iconName"
    class="shrink-0"
  />
</template>
