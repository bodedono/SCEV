<script setup lang="ts">
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import type { EvolucaoMensal } from '~/composables/useAnalytics'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

const props = defineProps<{
  data: EvolucaoMensal
}>()

const { moeda } = useFormatters()
const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')

const chartData = computed(() => ({
  labels: props.data.labels,
  datasets: [
    {
      label: 'Empréstimos',
      data: props.data.emprestimos,
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      fill: true,
      tension: 0.3
    },
    {
      label: 'Vales',
      data: props.data.vales,
      borderColor: '#f97316',
      backgroundColor: 'rgba(249, 115, 22, 0.1)',
      fill: true,
      tension: 0.3
    },
    {
      label: 'Recebimentos',
      data: props.data.recebimentos,
      borderColor: '#22c55e',
      backgroundColor: 'rgba(34, 197, 94, 0.1)',
      fill: true,
      tension: 0.3
    }
  ]
}))

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: { color: isDark.value ? '#9ca3af' : '#6b7280' }
    },
    tooltip: {
      callbacks: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        label: (ctx: any) => `${ctx.dataset.label}: ${moeda(ctx.parsed.y)}`
      }
    }
  },
  scales: {
    x: {
      ticks: { color: isDark.value ? '#9ca3af' : '#6b7280' },
      grid: { color: isDark.value ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }
    },
    y: {
      ticks: {
        color: isDark.value ? '#9ca3af' : '#6b7280',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        callback: (value: any) => moeda(value)
      },
      grid: { color: isDark.value ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }
    }
  }
}))
</script>

<template>
  <div class="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
    <h3 class="text-sm font-semibold mb-4 flex items-center gap-2">
      <UIcon
        name="i-lucide-trending-up"
        class="text-blue-500"
      />
      Evolução Mensal
    </h3>
    <div
      v-if="data.labels.length === 0"
      class="flex items-center justify-center h-64 text-gray-400 text-sm"
    >
      Sem dados para o período selecionado
    </div>
    <div
      v-else
      class="h-64"
    >
      <Line
        :data="chartData"
        :options="chartOptions"
      />
    </div>
  </div>
</template>
