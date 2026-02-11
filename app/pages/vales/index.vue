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

const valesFiltrados = computed(() => {
  return vales.value.filter(v => {
    const matchBusca = !busca.value
      || v.funcionario?.nome.toLowerCase().includes(busca.value.toLowerCase())
      || v.comentario.toLowerCase().includes(busca.value.toLowerCase())
    const matchStatus = !statusFiltro.value || v.status === statusFiltro.value
    return matchBusca && matchStatus
  })
})

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

    <div class="flex gap-4 mb-6">
      <UInput v-model="busca" placeholder="Buscar por funcionário ou motivo..." icon="i-lucide-search" class="flex-1 max-w-sm" />
      <USelect v-model="statusFiltro" :items="statusOptions" placeholder="Filtrar por status" class="w-56" />
    </div>

    <div v-if="carregando" class="text-center py-12 text-gray-500">Carregando...</div>

    <div v-else class="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th class="px-4 py-3 text-left font-medium text-gray-500">Funcionário</th>
            <th class="px-4 py-3 text-left font-medium text-gray-500">Motivo</th>
            <th class="px-4 py-3 text-left font-medium text-gray-500">Valor</th>
            <th class="px-4 py-3 text-left font-medium text-gray-500">Desconto</th>
            <th class="px-4 py-3 text-left font-medium text-gray-500">Data</th>
            <th class="px-4 py-3 text-left font-medium text-gray-500">Status</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
          <tr v-if="valesFiltrados.length === 0">
            <td colspan="6" class="px-4 py-8 text-center text-gray-500">Nenhum vale encontrado</td>
          </tr>
          <tr v-for="vale in valesFiltrados" :key="vale.id" class="hover:bg-gray-50 dark:hover:bg-gray-800/50">
            <td class="px-4 py-3">
              <NuxtLink :to="`/funcionarios/${vale.funcionario_id}`" class="font-medium hover:text-primary">
                {{ vale.funcionario?.nome }}
              </NuxtLink>
            </td>
            <td class="px-4 py-3 text-gray-500 truncate max-w-xs">{{ vale.comentario }}</td>
            <td class="px-4 py-3 font-medium">{{ moeda(vale.valor) }}</td>
            <td class="px-4 py-3 text-gray-500">{{ vale.forma_desconto === 'INTEGRAL' ? 'Integral' : `${vale.num_parcelas}x` }}</td>
            <td class="px-4 py-3 text-gray-500">{{ data(vale.data_ocorrido) }}</td>
            <td class="px-4 py-3"><StatusBadge :status="vale.status" /></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
