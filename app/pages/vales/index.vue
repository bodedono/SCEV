<script setup lang="ts">
const { podeCadastrar } = useAuth()
const { moeda, data } = useFormatters()
const { vales, carregando, listar } = useVales()

const busca = ref('')
const statusFiltro = ref<string | undefined>()

const statusOptions = [
  { label: 'Todos', value: undefined },
  { label: 'Pendente', value: 'PENDENTE' },
  { label: 'Pendente Aprovação', value: 'PENDENTE_APROVACAO' },
  { label: 'Quitado', value: 'QUITADO' },
  { label: 'Cancelado', value: 'CANCELADO' },
  { label: 'Rejeitado', value: 'REJEITADO' }
]

const filtrados = computed(() => {
  return vales.value.filter(v => {
    const matchBusca = !busca.value
      || v.funcionario?.nome.toLowerCase().includes(busca.value.toLowerCase())
      || v.comentario.toLowerCase().includes(busca.value.toLowerCase())
    const matchStatus = !statusFiltro.value || v.status === statusFiltro.value
    return matchBusca && matchStatus
  })
})

const columns = [
  { key: 'funcionario', label: 'Funcionário' },
  { key: 'comentario', label: 'Motivo' },
  { key: 'valor', label: 'Valor' },
  { key: 'desconto', label: 'Desconto' },
  { key: 'data_ocorrido', label: 'Data' },
  { key: 'status', label: 'Status' }
]

onMounted(() => listar())
</script>

<template>
  <div>
    <PageHeader titulo="Vales" descricao="Gerenciamento de vales">
      <template #acoes>
        <UButton v-if="podeCadastrar" icon="i-lucide-plus" to="/vales/novo">
          Novo Vale
        </UButton>
      </template>
    </PageHeader>

    <FilterBar
      v-model:busca="busca"
      v-model:filtro="statusFiltro"
      search-placeholder="Buscar por funcionário ou motivo..."
      :filter-options="statusOptions"
      filter-placeholder="Filtrar por status"
      show-filter
    />

    <DataTable :columns="columns" :data="filtrados" :loading="carregando" empty-text="Nenhum vale encontrado">
      <template #cell-funcionario="{ row }">
        <NuxtLink :to="`/funcionarios/${row.funcionario_id}`" class="font-medium hover:text-primary transition-colors">
          {{ row.funcionario?.nome }}
        </NuxtLink>
      </template>
      <template #cell-comentario="{ row }">
        <span class="text-gray-500 truncate max-w-xs block">{{ row.comentario }}</span>
      </template>
      <template #cell-valor="{ row }">
        <span class="font-medium">{{ moeda(row.valor) }}</span>
      </template>
      <template #cell-desconto="{ row }">
        <span class="text-gray-500">{{ row.forma_desconto === 'INTEGRAL' ? 'Integral' : `${row.num_parcelas}x` }}</span>
      </template>
      <template #cell-data_ocorrido="{ row }">
        <span class="text-gray-500">{{ data(row.data_ocorrido) }}</span>
      </template>
      <template #cell-status="{ row }">
        <StatusBadge :status="row.status" />
      </template>
    </DataTable>
  </div>
</template>
