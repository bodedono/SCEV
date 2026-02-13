<script setup lang="ts">
const { unidades, listar: listarUnidades } = useUnidades()
const { filtros, dados, carregando, carregar, atualizarPeriodo } = useAnalytics()

const unidadeOptions = computed(() => [
  { label: 'Todas as unidades', value: undefined },
  ...unidades.value.map(u => ({ label: u.nome, value: u.id }))
])

const handlePeriodoChange = (preset: string) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  atualizarPeriodo(preset as any)
  carregar()
}

const handleUnidadeChange = (value: number | undefined) => {
  filtros.value.unidadeId = value
  carregar()
}

const handleDataChange = () => {
  carregar()
}

onMounted(async () => {
  await listarUnidades()
  await carregar()
})
</script>

<template>
  <div>
    <PageHeader
      titulo="Analytics"
      descricao="Visão analítica de empréstimos, vales e parcelas"
    />

    <!-- Filtros -->
    <div class="mb-6">
      <AnalyticsFiltrosPeriodo
        :periodo="filtros.periodo"
        :data-inicio="filtros.dataInicio"
        :data-fim="filtros.dataFim"
        :unidade-id="filtros.unidadeId"
        :unidades="unidadeOptions"
        @update:periodo="handlePeriodoChange"
        @update:data-inicio="(v) => { filtros.dataInicio = v; handleDataChange() }"
        @update:data-fim="(v) => { filtros.dataFim = v; handleDataChange() }"
        @update:unidade-id="handleUnidadeChange"
      />
    </div>

    <!-- Loading -->
    <div
      v-if="carregando"
      class="flex flex-col items-center justify-center py-24 text-gray-400"
    >
      <UIcon
        name="i-lucide-loader-2"
        class="text-3xl animate-spin mb-3"
      />
      <p class="text-sm">
        Carregando analytics...
      </p>
    </div>

    <template v-else>
      <!-- KPIs -->
      <div class="mb-6">
        <AnalyticsKpiCards :kpis="dados.kpis" />
      </div>

      <!-- Resumo extra -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div class="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 flex items-center gap-3">
          <div class="flex items-center justify-center w-9 h-9 rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400">
            <UIcon name="i-lucide-calculator" />
          </div>
          <div>
            <p class="text-xs text-gray-500">
              Ticket Médio Empréstimo
            </p>
            <p class="font-bold">
              {{ useFormatters().moeda(dados.kpis.ticketMedioEmprestimo) }}
            </p>
          </div>
        </div>
        <div class="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 flex items-center gap-3">
          <div class="flex items-center justify-center w-9 h-9 rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400">
            <UIcon name="i-lucide-calculator" />
          </div>
          <div>
            <p class="text-xs text-gray-500">
              Ticket Médio Vale
            </p>
            <p class="font-bold">
              {{ useFormatters().moeda(dados.kpis.ticketMedioVale) }}
            </p>
          </div>
        </div>
        <div class="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 flex items-center gap-3">
          <div class="flex items-center justify-center w-9 h-9 rounded-lg bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400">
            <UIcon name="i-lucide-wallet" />
          </div>
          <div>
            <p class="text-xs text-gray-500">
              Total Pendente
            </p>
            <p class="font-bold text-red-600">
              {{ useFormatters().moeda(dados.kpis.totalPendente) }}
            </p>
          </div>
        </div>
      </div>

      <!-- Gráficos linha 1 -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <AnalyticsChartEmprestimosPorMes :data="dados.evolucaoMensal" />
        <AnalyticsChartStatusDistribuicao :data="dados.distribuicaoStatus" />
      </div>

      <!-- Gráficos linha 2 -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <AnalyticsChartUnidadesComparativo :data="dados.porUnidade" />
        <AnalyticsChartParcelasVencimento :data="dados.vencimentos" />
      </div>

      <!-- Top devedores -->
      <div class="mb-6">
        <AnalyticsTabelaTopDevedores :data="dados.topDevedores" />
      </div>
    </template>
  </div>
</template>
