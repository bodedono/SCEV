<script setup lang="ts">
import type { Parcela } from '~/types'

const { podeDarBaixa, perfilCarregado } = useAuth()
const { moeda, data } = useFormatters()
const { parcelas, carregando, listarPendentes, darBaixa } = useParcelas()

const parcelaSelecionada = ref<Parcela | null>(null)
const modalBaixa = ref(false)

const abrirBaixa = (parcela: Parcela) => {
  parcelaSelecionada.value = parcela
  modalBaixa.value = true
}

const handleBaixa = async (parcelaId: number, comprovante: File, observacoes?: string) => {
  await darBaixa(parcelaId, comprovante, observacoes)
  await listarPendentes()
}

const isAtrasada = (parcela: Parcela) => {
  return parcela.status === 'ATRASADA' || (parcela.status === 'PENDENTE' && new Date(parcela.data_prevista) < new Date())
}

onMounted(() => listarPendentes())
</script>

<template>
  <div>
    <PageHeader titulo="Parcelas Pendentes" descricao="Parcelas aguardando pagamento" />

    <div v-if="carregando" class="text-center py-12 text-gray-500">Carregando...</div>

    <div v-else class="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 dark:bg-gray-800">
          <tr>
            <th class="px-4 py-3 text-left font-medium text-gray-500">Funcionário</th>
            <th class="px-4 py-3 text-left font-medium text-gray-500">Tipo</th>
            <th class="px-4 py-3 text-left font-medium text-gray-500">Parcela</th>
            <th class="px-4 py-3 text-left font-medium text-gray-500">Valor</th>
            <th class="px-4 py-3 text-left font-medium text-gray-500">Vencimento</th>
            <th class="px-4 py-3 text-left font-medium text-gray-500">Status</th>
            <th v-if="podeDarBaixa" class="px-4 py-3 text-left font-medium text-gray-500">Ação</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
          <tr v-if="parcelas.length === 0">
            <td :colspan="podeDarBaixa ? 7 : 6" class="px-4 py-8 text-center text-gray-500">Nenhuma parcela pendente</td>
          </tr>
          <tr
            v-for="parcela in parcelas"
            :key="parcela.id"
            :class="isAtrasada(parcela) ? 'bg-red-50 dark:bg-red-950/10' : ''"
          >
            <td class="px-4 py-3 font-medium">{{ parcela.funcionario?.nome }}</td>
            <td class="px-4 py-3">
              <UBadge :color="parcela.tipo === 'EMPRESTIMO' ? 'info' : 'warning'" variant="subtle" size="xs">
                {{ parcela.tipo === 'EMPRESTIMO' ? 'Empréstimo' : 'Vale' }}
              </UBadge>
            </td>
            <td class="px-4 py-3 text-gray-500">{{ parcela.numero }}/{{ parcela.total_parcelas }}</td>
            <td class="px-4 py-3 font-medium">{{ moeda(parcela.valor) }}</td>
            <td class="px-4 py-3" :class="isAtrasada(parcela) ? 'text-red-600 font-semibold' : 'text-gray-500'">
              {{ data(parcela.data_prevista) }}
              <span v-if="isAtrasada(parcela)" class="ml-1 text-xs">ATRASADA</span>
            </td>
            <td class="px-4 py-3">
              <StatusBadge :status="isAtrasada(parcela) ? 'ATRASADA' : parcela.status" />
            </td>
            <td v-if="podeDarBaixa" class="px-4 py-3">
              <UButton size="xs" variant="soft" icon="i-lucide-check" @click="abrirBaixa(parcela)">
                Baixa
              </UButton>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="perfilCarregado && !podeDarBaixa" class="mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 text-sm text-blue-600 dark:text-blue-400 flex items-center gap-2">
      <UIcon name="i-lucide-info" />
      Você está em modo visualização. Contate o Admin para registrar baixas.
    </div>

    <ParcelaBaixaModal v-model="modalBaixa" :parcela="parcelaSelecionada" @confirmar="handleBaixa" />
  </div>
</template>
