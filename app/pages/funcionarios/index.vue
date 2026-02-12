<script setup lang="ts">
const { isAdmin, isGestor, unidadeId } = useAuth()
const { moeda } = useFormatters()
const { funcionarios, carregando, listar } = useFuncionarios()
const { unidades, listar: listarUnidades } = useUnidades()

const busca = ref('')
const unidadeFiltro = ref<number | undefined>()
const modalCadastro = ref(false)

const unidadeOptions = computed(() => [
  { label: 'Todas as unidades', value: undefined },
  ...unidades.value.map(u => ({ label: u.nome, value: u.id }))
])

const filtrados = computed(() => {
  return funcionarios.value.filter((f) => {
    const matchBusca = !busca.value
      || f.nome.toLowerCase().includes(busca.value.toLowerCase())
      || f.matricula.includes(busca.value)
    const matchUnidade = !unidadeFiltro.value || f.unidade_id === unidadeFiltro.value
    return matchBusca && matchUnidade
  })
})

const columns = [
  { key: 'nome', label: 'Nome' },
  { key: 'matricula', label: 'Matrícula' },
  { key: 'unidade', label: 'Unidade' },
  { key: 'cargo', label: 'Cargo' },
  { key: 'status', label: 'Status' },
  { key: 'saldo_devedor', label: 'Saldo Devedor' },
  { key: 'acoes', label: '' }
]

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleSalvar = async (dados: any) => {
  const { criar } = useFuncionarios()
  await criar(dados)
  modalCadastro.value = false
  await listar(isGestor.value ? unidadeId.value ?? undefined : undefined)
}

onMounted(async () => {
  await Promise.all([
    listar(isGestor.value ? unidadeId.value ?? undefined : undefined),
    listarUnidades()
  ])
})
</script>

<template>
  <div>
    <PageHeader
      titulo="Funcionários"
      descricao="Gerenciamento de funcionários"
    >
      <template #acoes>
        <UButton
          v-if="isAdmin"
          icon="i-lucide-plus"
          @click="modalCadastro = true"
        >
          Novo Funcionário
        </UButton>
      </template>
    </PageHeader>

    <FilterBar
      v-model:busca="busca"
      search-placeholder="Buscar por nome ou matrícula..."
    >
      <template #extra>
        <USelect
          v-if="!isGestor"
          v-model="unidadeFiltro"
          :items="unidadeOptions"
          placeholder="Filtrar por unidade"
          class="w-56"
        />
      </template>
    </FilterBar>

    <DataTable
      :columns="columns"
      :data="filtrados"
      :loading="carregando"
      empty-text="Nenhum funcionário encontrado"
      row-clickable
      @row-click="(row) => navigateTo(`/funcionarios/${row.id}`)"
    >
      <template #cell-nome="{ row }">
        <span class="font-medium">{{ row.nome }}</span>
      </template>
      <template #cell-matricula="{ row }">
        <span class="text-gray-500">{{ row.matricula }}</span>
      </template>
      <template #cell-unidade="{ row }">
        <span class="text-gray-500">{{ row.unidade?.nome }}</span>
      </template>
      <template #cell-cargo="{ row }">
        <span class="text-gray-500">{{ row.cargo }}</span>
      </template>
      <template #cell-status="{ row }">
        <UBadge
          :color="row.ativo ? 'success' : 'error'"
          variant="subtle"
          size="sm"
        >
          {{ row.ativo ? 'Ativo' : 'Inativo' }}
        </UBadge>
      </template>
      <template #cell-saldo_devedor="{ row }">
        <span
          class="font-medium"
          :class="(row.saldo_devedor ?? 0) > 0 ? 'text-red-600' : 'text-gray-500'"
        >
          {{ moeda(row.saldo_devedor ?? 0) }}
        </span>
      </template>
      <template #cell-acoes>
        <UButton
          icon="i-lucide-eye"
          variant="ghost"
          color="neutral"
          size="xs"
        />
      </template>
    </DataTable>

    <UModal v-model:open="modalCadastro">
      <template #header>
        <h3 class="text-lg font-semibold">
          Novo Funcionário
        </h3>
      </template>
      <template #body>
        <FuncionarioForm
          :unidades="unidades"
          @salvar="handleSalvar"
          @cancelar="modalCadastro = false"
        />
      </template>
    </UModal>
  </div>
</template>
