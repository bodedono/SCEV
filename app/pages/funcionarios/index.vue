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

const funcionariosFiltrados = computed(() => {
  return funcionarios.value.filter(f => {
    const matchBusca = !busca.value
      || f.nome.toLowerCase().includes(busca.value.toLowerCase())
      || f.matricula.includes(busca.value)
    const matchUnidade = !unidadeFiltro.value || f.unidade_id === unidadeFiltro.value
    return matchBusca && matchUnidade
  })
})

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
    <PageHeader titulo="Funcionários" descricao="Gerenciamento de funcionários">
      <template #acoes>
        <UButton v-if="isAdmin" icon="i-lucide-plus" @click="modalCadastro = true">
          Novo Funcionário
        </UButton>
      </template>
    </PageHeader>

    <!-- Filtros -->
    <div class="flex gap-4 mb-6">
      <UInput
        v-model="busca"
        placeholder="Buscar por nome ou matrícula..."
        icon="i-lucide-search"
        class="flex-1 max-w-sm"
      />
      <USelect
        v-if="!isGestor"
        v-model="unidadeFiltro"
        :items="unidadeOptions"
        placeholder="Filtrar por unidade"
        class="w-56"
      />
    </div>

    <!-- Loading -->
    <div v-if="carregando" class="text-center py-12 text-gray-500">
      Carregando funcionários...
    </div>

    <!-- Tabela -->
    <div v-else class="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th class="px-4 py-3 text-left font-medium text-gray-500">Nome</th>
            <th class="px-4 py-3 text-left font-medium text-gray-500">Matrícula</th>
            <th class="px-4 py-3 text-left font-medium text-gray-500">Unidade</th>
            <th class="px-4 py-3 text-left font-medium text-gray-500">Cargo</th>
            <th class="px-4 py-3 text-left font-medium text-gray-500">Status</th>
            <th class="px-4 py-3 text-left font-medium text-gray-500">Saldo Devedor</th>
            <th class="px-4 py-3 text-left font-medium text-gray-500" />
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
          <tr v-if="funcionariosFiltrados.length === 0">
            <td colspan="7" class="px-4 py-8 text-center text-gray-500">
              Nenhum funcionário encontrado
            </td>
          </tr>
          <tr
            v-for="func in funcionariosFiltrados"
            :key="func.id"
            class="hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
            @click="navigateTo(`/funcionarios/${func.id}`)"
          >
            <td class="px-4 py-3 font-medium">{{ func.nome }}</td>
            <td class="px-4 py-3 text-gray-500">{{ func.matricula }}</td>
            <td class="px-4 py-3 text-gray-500">{{ func.unidade?.nome }}</td>
            <td class="px-4 py-3 text-gray-500">{{ func.cargo }}</td>
            <td class="px-4 py-3">
              <UBadge :color="func.ativo ? 'success' : 'error'" variant="subtle" size="sm">
                {{ func.ativo ? 'Ativo' : 'Inativo' }}
              </UBadge>
            </td>
            <td class="px-4 py-3 font-medium" :class="(func.saldo_devedor ?? 0) > 0 ? 'text-red-600' : 'text-gray-500'">
              {{ moeda(func.saldo_devedor ?? 0) }}
            </td>
            <td class="px-4 py-3">
              <UButton icon="i-lucide-eye" variant="ghost" color="neutral" size="xs" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modal cadastro -->
    <UModal v-model:open="modalCadastro">
      <template #header>
        <h3 class="text-lg font-semibold">Novo Funcionário</h3>
      </template>
      <template #body>
        <FuncionarioForm :unidades="unidades" @salvar="handleSalvar" @cancelar="modalCadastro = false" />
      </template>
    </UModal>
  </div>
</template>
