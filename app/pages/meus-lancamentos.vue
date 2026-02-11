<script setup lang="ts">
import type { Emprestimo, Vale } from '~/types'

const { moeda, data } = useFormatters()

// TODO: buscar do Supabase (filtrado pelo usuário logado)
const meusEmprestimos = ref<Emprestimo[]>([])
const meusVales = ref<Vale[]>([])

const tab = ref('emprestimos')
const tabs = [
  { label: 'Empréstimos', value: 'emprestimos', icon: 'i-lucide-banknote' },
  { label: 'Vales', value: 'vales', icon: 'i-lucide-receipt' }
]
</script>

<template>
  <div>
    <PageHeader titulo="Meus Lançamentos" descricao="Empréstimos e vales que você cadastrou" />

    <!-- Tabs -->
    <div class="flex gap-2 mb-6">
      <UButton
        v-for="t in tabs"
        :key="t.value"
        :icon="t.icon"
        :variant="tab === t.value ? 'solid' : 'ghost'"
        :color="tab === t.value ? 'primary' : 'neutral'"
        @click="tab = t.value"
      >
        {{ t.label }}
      </UButton>
    </div>

    <!-- Empréstimos -->
    <div v-if="tab === 'emprestimos'" class="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th class="px-4 py-3 text-left font-medium text-gray-500">Funcionário</th>
            <th class="px-4 py-3 text-left font-medium text-gray-500">Valor</th>
            <th class="px-4 py-3 text-left font-medium text-gray-500">Data</th>
            <th class="px-4 py-3 text-left font-medium text-gray-500">Status</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
          <tr v-if="meusEmprestimos.length === 0">
            <td colspan="4" class="px-4 py-8 text-center text-gray-500">Nenhum empréstimo cadastrado</td>
          </tr>
          <tr v-for="emp in meusEmprestimos" :key="emp.id">
            <td class="px-4 py-3 font-medium">{{ emp.funcionario?.nome }}</td>
            <td class="px-4 py-3">{{ moeda(emp.valor_total) }}</td>
            <td class="px-4 py-3 text-gray-500">{{ data(emp.created_at) }}</td>
            <td class="px-4 py-3"><StatusBadge :status="emp.status" /></td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Vales -->
    <div v-if="tab === 'vales'" class="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th class="px-4 py-3 text-left font-medium text-gray-500">Funcionário</th>
            <th class="px-4 py-3 text-left font-medium text-gray-500">Motivo</th>
            <th class="px-4 py-3 text-left font-medium text-gray-500">Valor</th>
            <th class="px-4 py-3 text-left font-medium text-gray-500">Data</th>
            <th class="px-4 py-3 text-left font-medium text-gray-500">Status</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
          <tr v-if="meusVales.length === 0">
            <td colspan="5" class="px-4 py-8 text-center text-gray-500">Nenhum vale cadastrado</td>
          </tr>
          <tr v-for="vale in meusVales" :key="vale.id">
            <td class="px-4 py-3 font-medium">{{ vale.funcionario?.nome }}</td>
            <td class="px-4 py-3 text-gray-500 truncate max-w-xs">{{ vale.comentario }}</td>
            <td class="px-4 py-3">{{ moeda(vale.valor) }}</td>
            <td class="px-4 py-3 text-gray-500">{{ data(vale.created_at) }}</td>
            <td class="px-4 py-3"><StatusBadge :status="vale.status" /></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
