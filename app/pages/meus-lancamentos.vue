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

const colunasEmprestimos = [
  { key: 'funcionario', label: 'Funcionário' },
  { key: 'valor', label: 'Valor' },
  { key: 'data', label: 'Data' },
  { key: 'status', label: 'Status' }
]

const colunasVales = [
  { key: 'funcionario', label: 'Funcionário' },
  { key: 'comentario', label: 'Motivo' },
  { key: 'valor', label: 'Valor' },
  { key: 'data', label: 'Data' },
  { key: 'status', label: 'Status' }
]
</script>

<template>
  <div>
    <PageHeader
      titulo="Meus Lançamentos"
      descricao="Empréstimos e vales que você cadastrou"
    />

    <TabBar
      v-model="tab"
      :tabs="tabs"
    />

    <!-- Empréstimos -->
    <DataTable
      v-if="tab === 'emprestimos'"
      :columns="colunasEmprestimos"
      :data="meusEmprestimos"
      empty-text="Nenhum empréstimo cadastrado"
    >
      <template #cell-funcionario="{ row }">
        <span class="font-medium">{{ row.funcionario?.nome }}</span>
      </template>
      <template #cell-valor="{ row }">
        {{ moeda(row.valor_total) }}
      </template>
      <template #cell-data="{ row }">
        <span class="text-stone-500">{{ data(row.created_at) }}</span>
      </template>
      <template #cell-status="{ row }">
        <StatusBadge :status="row.status" />
      </template>
    </DataTable>

    <!-- Vales -->
    <DataTable
      v-if="tab === 'vales'"
      :columns="colunasVales"
      :data="meusVales"
      empty-text="Nenhum vale cadastrado"
    >
      <template #cell-funcionario="{ row }">
        <span class="font-medium">{{ row.funcionario?.nome }}</span>
      </template>
      <template #cell-comentario="{ row }">
        <span class="text-stone-500 truncate max-w-xs block">{{ row.comentario }}</span>
      </template>
      <template #cell-valor="{ row }">
        {{ moeda(row.valor) }}
      </template>
      <template #cell-data="{ row }">
        <span class="text-stone-500">{{ data(row.created_at) }}</span>
      </template>
      <template #cell-status="{ row }">
        <StatusBadge :status="row.status" />
      </template>
    </DataTable>
  </div>
</template>
