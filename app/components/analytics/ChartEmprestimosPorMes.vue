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
      borderColor: '#795548',
      backgroundColor: 'rgba(121, 85, 72, 0.1)',
      fill: true,
      tension: 0.3
    },
    {
      label: 'Vales',
      data: props.data.vales,
      borderColor: '#D4A574',
      backgroundColor: 'rgba(212, 165, 116, 0.1)',
      fill: true,
      tension: 0.3
    },
    {
      label: 'Recebimentos',
      data: props.data.recebimentos,
      borderColor: '#6D9B76',
      backgroundColor: 'rgba(109, 155, 118, 0.1)',
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
      labels: { color: isDark.value ? '#BCAAA4' : '#8D6E63' }
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
      ticks: { color: isDark.value ? '#BCAAA4' : '#8D6E63' },
      grid: { color: isDark.value ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }
    },
    y: {
      ticks: {
        color: isDark.value ? '#BCAAA4' : '#8D6E63',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        callback: (value: any) => moeda(value)
      },
      grid: { color: isDark.value ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }
    }
  }
}))
</script>

<template>
  <div class="card p-5">
    <h3 class="text-sm font-semibold mb-4 flex items-center gap-2">
      <AppIcon
        name="i-lucide-trending-up"
        class="text-amber-600"
      />
      Evolução Mensal
    </h3>
    <div
      v-if="data.labels.length === 0"
      class="flex items-center justify-center h-64 text-sm"
      style="color: var(--text-muted);"
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
