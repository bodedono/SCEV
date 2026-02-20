<script setup lang="ts">
const colorMode = useColorMode()

const toggle = () => {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}
</script>

<template>
  <AppButton
    :icon="colorMode.value === 'dark' ? 'i-lucide-sun' : 'i-lucide-moon'"
    variant="ghost"
    color="neutral"
    size="sm"
    @click="toggle"
  />
</template>
