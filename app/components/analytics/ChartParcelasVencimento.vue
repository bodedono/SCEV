<script setup lang="ts">
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import type { VencimentosFaixa } from '~/composables/useAnalytics'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const props = defineProps<{
  data: VencimentosFaixa
}>()

const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')

const total = computed(() =>
  props.data.emDia + props.data.vence7dias + props.data.vence30dias + props.data.atrasadas
)

const chartData = computed(() => ({
  labels: ['Em dia', 'Vence em 7 dias', 'Vence em 30 dias', 'Atrasadas'],
  datasets: [{
    data: [props.data.emDia, props.data.vence7dias, props.data.vence30dias, props.data.atrasadas],
    backgroundColor: ['#22c55e', '#eab308', '#f97316', '#ef4444'],
    borderRadius: 4
  }]
}))

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: 'y' as const,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        label: (ctx: any) => `${ctx.parsed.x} parcela(s)`
      }
    }
  },
  scales: {
    x: {
      ticks: { color: isDark.value ? '#9ca3af' : '#6b7280' },
      grid: { color: isDark.value ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }
    },
    y: {
      ticks: { color: isDark.value ? '#9ca3af' : '#6b7280' },
      grid: { display: false }
    }
  }
}))
</script>

<template>
  <div class="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
    <h3 class="text-sm font-semibold mb-4 flex items-center gap-2">
      <UIcon
        name="i-lucide-calendar-clock"
        class="text-amber-500"
      />
      Parcelas por Vencimento
    </h3>
    <div
      v-if="total === 0"
      class="flex items-center justify-center h-64 text-gray-400 text-sm"
    >
      Nenhuma parcela pendente
    </div>
    <div
      v-else
      class="h-64"
    >
      <Bar
        :data="chartData"
        :options="chartOptions"
      />
    </div>
  </div>
</template>
