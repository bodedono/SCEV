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
      backgroundColor: '#795548',
      borderRadius: 4
    },
    {
      label: 'Vales',
      data: props.data.map(d => d.vales),
      backgroundColor: '#D4A574',
      borderRadius: 4
    },
    {
      label: 'Saldo Devedor',
      data: props.data.map(d => d.saldoDevedor),
      backgroundColor: '#C0392B',
      borderRadius: 4
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
      grid: { display: false }
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
        name="i-lucide-building-2"
        class="text-amber-700"
      />
      Comparativo por Unidade
    </h3>
    <div
      v-if="data.length === 0"
      class="flex items-center justify-center h-64 text-sm"
      style="color: var(--text-muted);"
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
