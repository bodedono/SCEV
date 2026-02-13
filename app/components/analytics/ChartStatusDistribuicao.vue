<script setup lang="ts">
import { Doughnut } from 'vue-chartjs'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import type { DistribuicaoStatus } from '~/composables/useAnalytics'

ChartJS.register(ArcElement, Tooltip, Legend)

const props = defineProps<{
  data: DistribuicaoStatus
}>()

const { moeda } = useFormatters()
const colorMode = useColorMode()
const isDark = computed(() => colorMode.value === 'dark')

const tab = ref<'emprestimos' | 'vales'>('emprestimos')

const STATUS_COLORS: Record<string, string> = {
  PENDENTE_APROVACAO: '#eab308',
  ATIVO: '#3b82f6',
  PENDENTE: '#f97316',
  QUITADO: '#22c55e',
  CANCELADO: '#6b7280',
  REJEITADO: '#ef4444'
}

const STATUS_LABELS: Record<string, string> = {
  PENDENTE_APROVACAO: 'Pendente Aprovação',
  ATIVO: 'Ativo',
  PENDENTE: 'Pendente',
  QUITADO: 'Quitado',
  CANCELADO: 'Cancelado',
  REJEITADO: 'Rejeitado'
}

const activeData = computed(() =>
  tab.value === 'emprestimos' ? props.data.emprestimos : props.data.vales
)

const chartData = computed(() => ({
  labels: activeData.value.map(d => STATUS_LABELS[d.status] ?? d.status),
  datasets: [{
    data: activeData.value.map(d => d.valor),
    backgroundColor: activeData.value.map(d => STATUS_COLORS[d.status] ?? '#9ca3af'),
    borderWidth: 0
  }]
}))

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: { color: isDark.value ? '#9ca3af' : '#6b7280', padding: 16 }
    },
    tooltip: {
      callbacks: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        label: (ctx: any) => {
          const item = activeData.value[ctx.dataIndex]
          return `${ctx.label}: ${moeda(ctx.parsed)} (${item?.count ?? 0})`
        }
      }
    }
  }
}))

const hasData = computed(() => activeData.value.length > 0)
</script>

<template>
  <div class="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-sm font-semibold flex items-center gap-2">
        <UIcon
          name="i-lucide-pie-chart"
          class="text-purple-500"
        />
        Distribuição por Status
      </h3>
      <div class="flex gap-1">
        <UButton
          size="xs"
          :variant="tab === 'emprestimos' ? 'solid' : 'ghost'"
          :color="tab === 'emprestimos' ? 'primary' : 'neutral'"
          @click="tab = 'emprestimos'"
        >
          Empréstimos
        </UButton>
        <UButton
          size="xs"
          :variant="tab === 'vales' ? 'solid' : 'ghost'"
          :color="tab === 'vales' ? 'primary' : 'neutral'"
          @click="tab = 'vales'"
        >
          Vales
        </UButton>
      </div>
    </div>
    <div
      v-if="!hasData"
      class="flex items-center justify-center h-64 text-gray-400 text-sm"
    >
      Sem dados para o período selecionado
    </div>
    <div
      v-else
      class="h-64"
    >
      <Doughnut
        :data="chartData"
        :options="chartOptions"
      />
    </div>
  </div>
</template>
