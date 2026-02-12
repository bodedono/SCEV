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

const columns = computed(() => {
  const cols = [
    { key: 'funcionario', label: 'Funcionário' },
    { key: 'tipo', label: 'Tipo' },
    { key: 'parcela', label: 'Parcela' },
    { key: 'valor', label: 'Valor' },
    { key: 'vencimento', label: 'Vencimento' },
    { key: 'status', label: 'Status' }
  ]
  if (podeDarBaixa.value) {
    cols.push({ key: 'acao', label: 'Ação' })
  }
  return cols
})

const rowClass = (row: Parcela) => isAtrasada(row) ? 'bg-red-50 dark:bg-red-950/10' : ''

onMounted(() => listarPendentes())
</script>

<template>
  <div>
    <PageHeader
      titulo="Parcelas Pendentes"
      descricao="Parcelas aguardando pagamento"
    />

    <DataTable
      :columns="columns"
      :data="parcelas"
      :loading="carregando"
      :row-class="rowClass"
      empty-text="Nenhuma parcela pendente"
      empty-icon="i-lucide-check-circle"
    >
      <template #cell-funcionario="{ row }">
        <span class="font-medium">{{ row.funcionario?.nome }}</span>
      </template>
      <template #cell-tipo="{ row }">
        <UBadge
          :color="row.tipo === 'EMPRESTIMO' ? 'info' : 'warning'"
          variant="subtle"
          size="xs"
        >
          {{ row.tipo === 'EMPRESTIMO' ? 'Empréstimo' : 'Vale' }}
        </UBadge>
      </template>
      <template #cell-parcela="{ row }">
        <span class="text-gray-500">{{ row.numero }}/{{ row.total_parcelas }}</span>
      </template>
      <template #cell-valor="{ row }">
        <span class="font-medium">{{ moeda(row.valor) }}</span>
      </template>
      <template #cell-vencimento="{ row }">
        <span :class="isAtrasada(row) ? 'text-red-600 font-semibold' : 'text-gray-500'">
          {{ data(row.data_prevista) }}
          <span
            v-if="isAtrasada(row)"
            class="ml-1 text-xs"
          >ATRASADA</span>
        </span>
      </template>
      <template #cell-status="{ row }">
        <StatusBadge :status="isAtrasada(row) ? 'ATRASADA' : row.status" />
      </template>
      <template #cell-acao="{ row }">
        <UButton
          size="xs"
          variant="soft"
          color="success"
          icon="i-lucide-check"
          @click="abrirBaixa(row)"
        >
          Baixa
        </UButton>
      </template>
    </DataTable>

    <InfoAlert
      v-if="perfilCarregado && !podeDarBaixa"
      message="Você está em modo visualização. Contate o Admin para registrar baixas."
      color="blue"
      icon="i-lucide-info"
    />

    <ParcelaBaixaModal
      v-model="modalBaixa"
      :parcela="parcelaSelecionada"
      @confirmar="handleBaixa"
    />
  </div>
</template>
