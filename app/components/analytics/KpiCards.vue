<script setup lang="ts">
import type { KpiData } from '~/composables/useAnalytics'

defineProps<{
  kpis: KpiData
}>()

const { moeda } = useFormatters()

const formatVar = (val: number) => {
  if (val === 0) return '0%'
  const sinal = val > 0 ? '+' : ''
  return `${sinal}${val.toFixed(1)}%`
}
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    <!-- Total Emprestado -->
    <div class="card p-5">
      <div class="flex items-center gap-3 mb-3">
        <div class="flex items-center justify-center w-10 h-10 rounded-lg icon-box-emprestimo">
          <AppIcon
            name="i-lucide-banknote"
            class="text-xl"
          />
        </div>
        <p
          class="text-sm"
          style="color: var(--text-secondary);"
        >
          Total Emprestado
        </p>
      </div>
      <p class="text-2xl font-bold">
        {{ moeda(kpis.totalEmprestado) }}
      </p>
      <p
        class="text-xs mt-1"
        :class="kpis.variacaoEmprestado >= 0 ? 'text-green-600' : 'text-red-600'"
      >
        {{ formatVar(kpis.variacaoEmprestado) }} vs período anterior
      </p>
    </div>

    <!-- Total Vales -->
    <div class="card p-5">
      <div class="flex items-center gap-3 mb-3">
        <div class="flex items-center justify-center w-10 h-10 rounded-lg icon-box-vale">
          <AppIcon
            name="i-lucide-receipt"
            class="text-xl"
          />
        </div>
        <p
          class="text-sm"
          style="color: var(--text-secondary);"
        >
          Total Vales
        </p>
      </div>
      <p class="text-2xl font-bold">
        {{ moeda(kpis.totalVales) }}
      </p>
      <p
        class="text-xs mt-1"
        :class="kpis.variacaoVales >= 0 ? 'text-green-600' : 'text-red-600'"
      >
        {{ formatVar(kpis.variacaoVales) }} vs período anterior
      </p>
    </div>

    <!-- Total Recebido -->
    <div class="card p-5">
      <div class="flex items-center gap-3 mb-3">
        <div class="flex items-center justify-center w-10 h-10 rounded-lg icon-box-recebimento">
          <AppIcon
            name="i-lucide-trending-up"
            class="text-xl"
          />
        </div>
        <p
          class="text-sm"
          style="color: var(--text-secondary);"
        >
          Total Recebido
        </p>
      </div>
      <p class="text-2xl font-bold">
        {{ moeda(kpis.totalRecebido) }}
      </p>
      <p
        class="text-xs mt-1"
        :class="kpis.variacaoRecebido >= 0 ? 'text-green-600' : 'text-red-600'"
      >
        {{ formatVar(kpis.variacaoRecebido) }} vs período anterior
      </p>
    </div>

    <!-- Taxa de Adimplência -->
    <div class="card p-5">
      <div class="flex items-center gap-3 mb-3">
        <div class="flex items-center justify-center w-10 h-10 rounded-lg icon-box-adimplencia">
          <AppIcon
            name="i-lucide-shield-check"
            class="text-xl"
          />
        </div>
        <p
          class="text-sm"
          style="color: var(--text-secondary);"
        >
          Adimplência
        </p>
      </div>
      <p class="text-2xl font-bold">
        {{ kpis.taxaAdimplencia.toFixed(1) }}%
      </p>
      <p
        class="text-xs mt-1"
        :class="kpis.variacaoAdimplencia >= 0 ? 'text-green-600' : 'text-red-600'"
      >
        {{ formatVar(kpis.variacaoAdimplencia) }}pp vs período anterior
      </p>
    </div>
  </div>
</template>
