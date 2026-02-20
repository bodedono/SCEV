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
  PENDENTE_APROVACAO: '#D4A574',
  ATIVO: '#795548',
  PENDENTE: '#C4956A',
  QUITADO: '#6D9B76',
  CANCELADO: '#8D6E63',
  REJEITADO: '#C0392B'
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
    backgroundColor: activeData.value.map(d => STATUS_COLORS[d.status] ?? '#BCAAA4'),
    borderWidth: 0
  }]
}))

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: { color: isDark.value ? '#BCAAA4' : '#8D6E63', padding: 16 }
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
  <div class="card p-5">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-sm font-semibold flex items-center gap-2">
        <AppIcon
          name="i-lucide-pie-chart"
          class="text-amber-700"
        />
        Distribuição por Status
      </h3>
      <div class="flex gap-1">
        <AppButton
          size="xs"
          :variant="tab === 'emprestimos' ? 'solid' : 'ghost'"
          :color="tab === 'emprestimos' ? 'primary' : 'neutral'"
          @click="tab = 'emprestimos'"
        >
          Empréstimos
        </AppButton>
        <AppButton
          size="xs"
          :variant="tab === 'vales' ? 'solid' : 'ghost'"
          :color="tab === 'vales' ? 'primary' : 'neutral'"
          @click="tab = 'vales'"
        >
          Vales
        </AppButton>
      </div>
    </div>
    <div
      v-if="!hasData"
      class="flex items-center justify-center h-64 text-sm"
      style="color: var(--text-muted);"
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
