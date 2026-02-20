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
    backgroundColor: ['#6D9B76', '#D4A574', '#C4956A', '#C0392B'],
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
      ticks: { color: isDark.value ? '#BCAAA4' : '#8D6E63' },
      grid: { color: isDark.value ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }
    },
    y: {
      ticks: { color: isDark.value ? '#BCAAA4' : '#8D6E63' },
      grid: { display: false }
    }
  }
}))
</script>

<template>
  <div class="card p-5">
    <h3 class="text-sm font-semibold mb-4 flex items-center gap-2">
      <AppIcon
        name="i-lucide-calendar-clock"
        class="text-amber-600"
      />
      Parcelas por Vencimento
    </h3>
    <div
      v-if="total === 0"
      class="flex items-center justify-center h-64 text-sm"
      style="color: var(--text-muted);"
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
