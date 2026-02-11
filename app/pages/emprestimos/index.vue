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

const emprestimosFiltrados = computed(() => {
  return emprestimos.value.filter(e => {
    const matchBusca = !busca.value
      || e.funcionario?.nome.toLowerCase().includes(busca.value.toLowerCase())
    const matchStatus = !statusFiltro.value || e.status === statusFiltro.value
    return matchBusca && matchStatus
  })
})

onMounted(() => listar())
</script>

<template>
  <div>
    <PageHeader titulo="Empréstimos" descricao="Gerenciamento de empréstimos">
      <template #acoes>
        <UButton v-if="podeCadastrar" icon="i-lucide-plus" to="/emprestimos/novo">
          Novo Empréstimo
        </UButton>
      </template>
    </PageHeader>

    <div class="flex gap-4 mb-6">
      <UInput v-model="busca" placeholder="Buscar por funcionário..." icon="i-lucide-search" class="flex-1 max-w-sm" />
      <USelect v-model="statusFiltro" :items="statusOptions" placeholder="Filtrar por status" class="w-56" />
    </div>

    <div v-if="carregando" class="text-center py-12 text-gray-500">Carregando...</div>

    <div v-else class="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th class="px-4 py-3 text-left font-medium text-gray-500">Funcionário</th>
            <th class="px-4 py-3 text-left font-medium text-gray-500">Unidade</th>
            <th class="px-4 py-3 text-left font-medium text-gray-500">Valor Total</th>
            <th class="px-4 py-3 text-left font-medium text-gray-500">Parcelas</th>
            <th class="px-4 py-3 text-left font-medium text-gray-500">Início</th>
            <th class="px-4 py-3 text-left font-medium text-gray-500">Status</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
          <tr v-if="emprestimosFiltrados.length === 0">
            <td colspan="6" class="px-4 py-8 text-center text-gray-500">Nenhum empréstimo encontrado</td>
          </tr>
          <tr v-for="emp in emprestimosFiltrados" :key="emp.id" class="hover:bg-gray-50 dark:hover:bg-gray-800/50">
            <td class="px-4 py-3">
              <NuxtLink :to="`/funcionarios/${emp.funcionario_id}`" class="font-medium hover:text-primary">
                {{ emp.funcionario?.nome }}
              </NuxtLink>
              <p class="text-xs text-gray-400">{{ emp.funcionario?.matricula }}</p>
            </td>
            <td class="px-4 py-3 text-gray-500">{{ emp.funcionario?.unidade?.nome }}</td>
            <td class="px-4 py-3 font-medium">{{ moeda(emp.valor_total) }}</td>
            <td class="px-4 py-3 text-gray-500">{{ emp.num_parcelas }}x {{ moeda(emp.valor_parcela) }}</td>
            <td class="px-4 py-3 text-gray-500">{{ data(emp.data_inicio_desconto) }}</td>
            <td class="px-4 py-3"><StatusBadge :status="emp.status" /></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
