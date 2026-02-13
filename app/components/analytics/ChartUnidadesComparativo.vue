<script setup lang="ts">
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import type { UnidadeMetrica } from '~/composables/useAnalytics'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const props = defineProps<{
  data: UnidadeMetrica[]
}>()

const { moeda } = useFormatters()
const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')

const chartData = computed(() => ({
  labels: props.data.map(d => d.unidade),
  datasets: [
    {
      label: 'Empréstimos',
      data: props.data.map(d => d.emprestimos),
      backgroundColor: '#3b82f6',
      borderRadius: 4
    },
    {
      label: 'Vales',
      data: props.data.map(d => d.vales),
      backgroundColor: '#f97316',
      borderRadius: 4
    },
    {
      label: 'Saldo Devedor',
      data: props.data.map(d => d.saldoDevedor),
      backgroundColor: '#ef4444',
      borderRadius: 4
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
      grid: { display: false }
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
        name="i-lucide-building-2"
        class="text-indigo-500"
      />
      Comparativo por Unidade
    </h3>
    <div
      v-if="data.length === 0"
      class="flex items-center justify-center h-64 text-gray-400 text-sm"
    >
      Sem dados para o período selecionado
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
