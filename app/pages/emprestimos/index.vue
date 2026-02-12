<script setup lang="ts">
const { podeCadastrar } = useAuth()
const { moeda, data } = useFormatters()
const { emprestimos, carregando, listar } = useEmprestimos()

const busca = ref('')
const statusFiltro = ref<string | undefined>()

const statusOptions = [
  { label: 'Todos', value: undefined },
  { label: 'Ativo', value: 'ATIVO' },
  { label: 'Pendente Aprovação', value: 'PENDENTE_APROVACAO' },
  { label: 'Quitado', value: 'QUITADO' },
  { label: 'Cancelado', value: 'CANCELADO' },
  { label: 'Rejeitado', value: 'REJEITADO' }
]

const filtrados = computed(() => {
  return emprestimos.value.filter((e) => {
    const matchBusca = !busca.value
      || e.funcionario?.nome.toLowerCase().includes(busca.value.toLowerCase())
    const matchStatus = !statusFiltro.value || e.status === statusFiltro.value
    return matchBusca && matchStatus
  })
})

const columns = [
  { key: 'funcionario', label: 'Funcionário' },
  { key: 'unidade', label: 'Unidade' },
  { key: 'valor_total', label: 'Valor Total' },
  { key: 'parcelas', label: 'Parcelas' },
  { key: 'data_inicio_desconto', label: 'Início' },
  { key: 'status', label: 'Status' }
]

onMounted(() => listar())
</script>

<template>
  <div>
    <PageHeader
      titulo="Empréstimos"
      descricao="Gerenciamento de empréstimos"
    >
      <template #acoes>
        <UButton
          v-if="podeCadastrar"
          icon="i-lucide-plus"
          to="/emprestimos/novo"
        >
          Novo Empréstimo
        </UButton>
      </template>
    </PageHeader>

    <FilterBar
      v-model:busca="busca"
      v-model:filtro="statusFiltro"
      search-placeholder="Buscar por funcionário..."
      :filter-options="statusOptions"
      filter-placeholder="Filtrar por status"
      show-filter
    />

    <DataTable
      :columns="columns"
      :data="filtrados"
      :loading="carregando"
      empty-text="Nenhum empréstimo encontrado"
    >
      <template #cell-funcionario="{ row }">
        <NuxtLink
          :to="`/funcionarios/${row.funcionario_id}`"
          class="font-medium hover:text-primary transition-colors"
        >
          {{ row.funcionario?.nome }}
        </NuxtLink>
        <p class="text-xs text-gray-400">
          {{ row.funcionario?.matricula }}
        </p>
      </template>
      <template #cell-unidade="{ row }">
        <span class="text-gray-500">{{ row.funcionario?.unidade?.nome }}</span>
      </template>
      <template #cell-valor_total="{ row }">
        <span class="font-medium">{{ moeda(row.valor_total) }}</span>
      </template>
      <template #cell-parcelas="{ row }">
        <span class="text-gray-500">{{ row.num_parcelas }}x {{ moeda(row.valor_parcela) }}</span>
      </template>
      <template #cell-data_inicio_desconto="{ row }">
        <span class="text-gray-500">{{ data(row.data_inicio_desconto) }}</span>
      </template>
      <template #cell-status="{ row }">
        <StatusBadge :status="row.status" />
      </template>
    </DataTable>
  </div>
</template>
