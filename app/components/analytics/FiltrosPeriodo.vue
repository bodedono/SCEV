<script setup lang="ts">
import type { PeriodoPreset } from '~/composables/useAnalytics'

defineProps<{
  periodo: PeriodoPreset
  dataInicio: string
  dataFim: string
  unidadeId?: number
  unidades: { label: string, value: number | undefined }[]
}>()

const emit = defineEmits<{
  'update:periodo': [value: PeriodoPreset]
  'update:dataInicio': [value: string]
  'update:dataFim': [value: string]
  'update:unidadeId': [value: number | undefined]
}>()

const presets: { label: string, value: PeriodoPreset }[] = [
  { label: 'Mês Atual', value: 'mes_atual' },
  { label: 'Trimestre', value: 'trimestre' },
  { label: 'Semestre', value: 'semestre' },
  { label: 'Ano', value: 'ano' },
  { label: 'Personalizado', value: 'custom' }
]
</script>

<template>
  <div class="flex flex-wrap items-center gap-3">
    <!-- Presets de período -->
    <div class="flex gap-1">
      <UButton
        v-for="preset in presets"
        :key="preset.value"
        size="sm"
        :variant="periodo === preset.value ? 'solid' : 'ghost'"
        :color="periodo === preset.value ? 'primary' : 'neutral'"
        @click="emit('update:periodo', preset.value)"
      >
        {{ preset.label }}
      </UButton>
    </div>

    <div class="flex-1" />

    <!-- Datas customizadas -->
    <div
      v-if="periodo === 'custom'"
      class="flex items-center gap-2"
    >
      <UInput
        type="date"
        size="sm"
        :model-value="dataInicio"
        @update:model-value="emit('update:dataInicio', $event as string)"
      />
      <span class="text-gray-400 text-sm">até</span>
      <UInput
        type="date"
        size="sm"
        :model-value="dataFim"
        @update:model-value="emit('update:dataFim', $event as string)"
      />
    </div>

    <!-- Filtro de unidade -->
    <USelect
      size="sm"
      :model-value="unidadeId"
      :items="unidades"
      placeholder="Todas as unidades"
      class="w-48"
      @update:model-value="emit('update:unidadeId', $event as number | undefined)"
    />
  </div>
</template>
