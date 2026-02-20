<script setup lang="ts">
import type { Emprestimo } from '~/types'

const { isAdmin, podeCadastrar } = useAuth()
const { moeda, data } = useFormatters()
const { emprestimos, carregando, listar, atualizar, excluir } = useEmprestimos()
const { comFeedback } = useToastFeedback()

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
  { key: 'unidade', label: 'Unidade', hideBelow: 'md' as const },
  { key: 'valor_total', label: 'Valor Total' },
  { key: 'parcelas', label: 'Parcelas', hideBelow: 'md' as const },
  { key: 'data_inicio_desconto', label: 'Início', hideBelow: 'lg' as const },
  { key: 'status', label: 'Status' }
]

// Modal detalhe
const modalDetalhe = useModalState<Emprestimo>()
type ModoDetalhe = 'ver' | 'editar' | 'excluir'
const modo = ref<ModoDetalhe>('ver')
const salvando = ref(false)

// Form edição
const formEdit = reactive({
  valor_total: 0,
  num_parcelas: 1,
  data_inicio_desconto: '',
  motivo: ''
})

const TAXA_MENSAL = 0.015

const valorParcelaEdit = computed(() => {
  const pv = formEdit.valor_total
  const n = formEdit.num_parcelas
  if (pv <= 0 || n <= 0) return 0
  const fator = Math.pow(1 + TAXA_MENSAL, n)
  return Math.round((pv * (TAXA_MENSAL * fator) / (fator - 1)) * 100) / 100
})

// Abrir detalhe
const abrirDetalhe = (emp: Emprestimo) => {
  modalDetalhe.abrir(emp)
  modo.value = 'ver'
}

// Entrar edição
const entrarEdicao = () => {
  const emp = modalDetalhe.item.value
  if (!emp) return
  formEdit.valor_total = emp.valor_total
  formEdit.num_parcelas = emp.num_parcelas
  formEdit.data_inicio_desconto = emp.data_inicio_desconto
  formEdit.motivo = emp.motivo
  modo.value = 'editar'
}

// Salvar edição
const handleSalvar = async () => {
  if (!modalDetalhe.item.value) return
  salvando.value = true
  try {
    const result = await comFeedback(
      () => atualizar(modalDetalhe.item.value!.id, {
        valor_total: formEdit.valor_total,
        num_parcelas: formEdit.num_parcelas,
        data_inicio_desconto: formEdit.data_inicio_desconto,
        motivo: formEdit.motivo
      }),
      'Empréstimo atualizado com sucesso',
      'Erro ao atualizar empréstimo'
    )
    if (result) {
      modalDetalhe.item.value = result
      modo.value = 'ver'
      await listar()
    }
  } finally {
    salvando.value = false
  }
}

// Excluir
const handleExcluir = async () => {
  const id = modalDetalhe.item.value?.id
  if (!id) return
  const result = await comFeedback(
    () => excluir(id),
    'Empréstimo excluído permanentemente',
    'Erro ao excluir empréstimo'
  )
  if (result !== null) {
    modalDetalhe.fechar()
    await listar()
  }
}

// Título e ícone dinâmicos
const tituloDetalhe = computed(() => {
  if (modo.value === 'editar') return 'Editar Empréstimo'
  if (modo.value === 'excluir') return 'Excluir Empréstimo'
  return 'Detalhes do Empréstimo'
})

const iconeDetalhe = computed(() => {
  if (modo.value === 'editar') return 'i-lucide-pencil'
  if (modo.value === 'excluir') return 'i-lucide-trash-2'
  return 'i-lucide-banknote'
})

onMounted(() => listar())
</script>

<template>
  <div>
    <PageHeader
      titulo="Empréstimos"
      descricao="Gerenciamento de empréstimos"
    >
      <template #acoes>
        <AppButton
          v-if="podeCadastrar"
          icon="i-lucide-plus"
          to="/emprestimos/novo"
        >
          Novo Empréstimo
        </AppButton>
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
        <div class="flex items-center gap-2">
          <div class="flex-1 min-w-0">
            <NuxtLink
              :to="`/funcionarios/${row.funcionario_id}`"
              class="font-medium hover:text-primary transition-colors"
            >
              {{ row.funcionario?.nome }}
            </NuxtLink>
            <p class="text-xs text-stone-400">
              {{ row.funcionario?.matricula }}
            </p>
          </div>
          <AppButton
            icon="i-lucide-eye"
            variant="ghost"
            color="neutral"
            size="xs"
            @click.stop="abrirDetalhe(row)"
          />
        </div>
      </template>
      <template #cell-unidade="{ row }">
        <span class="text-stone-500">{{ row.funcionario?.unidade?.nome }}</span>
      </template>
      <template #cell-valor_total="{ row }">
        <span class="font-medium">{{ moeda(row.valor_total) }}</span>
      </template>
      <template #cell-parcelas="{ row }">
        <span class="text-stone-500">{{ row.num_parcelas }}x {{ moeda(row.valor_parcela) }}</span>
      </template>
      <template #cell-data_inicio_desconto="{ row }">
        <span class="text-stone-500">{{ data(row.data_inicio_desconto) }}</span>
      </template>
      <template #cell-status="{ row }">
        <StatusBadge :status="row.status" />
      </template>
    </DataTable>

    <!-- Modal Detalhe -->
    <AppModal
      v-model:open="modalDetalhe.aberto.value"
      :title="tituloDetalhe"
      :icon="iconeDetalhe"
      :destructive="modo === 'excluir'"
      size="lg"
    >
      <template v-if="modalDetalhe.item.value">
        <!-- MODO VER -->
        <div
          v-if="modo === 'ver'"
          class="space-y-4"
        >
          <div class="flex items-center gap-3 mb-2">
            <div class="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary">
              <AppIcon
                name="i-lucide-banknote"
                class="text-xl"
              />
            </div>
            <div class="flex-1">
              <h4 class="font-semibold text-lg">
                {{ modalDetalhe.item.value.funcionario?.nome }}
              </h4>
              <p class="text-sm text-stone-500">
                {{ modalDetalhe.item.value.funcionario?.matricula }}
              </p>
            </div>
            <StatusBadge :status="modalDetalhe.item.value.status" />
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-lg bg-surface-area">
            <div>
              <p class="text-xs text-stone-400 mb-1">
                Valor Emprestado
              </p>
              <p class="text-sm font-bold">
                {{ moeda(modalDetalhe.item.value.valor_total) }}
              </p>
            </div>
            <div>
              <p class="text-xs text-stone-400 mb-1">
                Parcelas
              </p>
              <p class="text-sm font-medium">
                {{ modalDetalhe.item.value.num_parcelas }}x {{ moeda(modalDetalhe.item.value.valor_parcela) }}
              </p>
            </div>
            <div>
              <p class="text-xs text-stone-400 mb-1">
                Início Desconto
              </p>
              <p class="text-sm">
                {{ data(modalDetalhe.item.value.data_inicio_desconto) }}
              </p>
            </div>
          </div>

          <div
            v-if="modalDetalhe.item.value.motivo"
            class="p-3 rounded-lg bg-surface-area"
          >
            <p class="text-xs text-stone-400 mb-1">
              Motivo / Justificativa
            </p>
            <p class="text-sm">
              {{ modalDetalhe.item.value.motivo }}
            </p>
          </div>

          <div class="grid grid-cols-2 gap-3 text-xs text-stone-400">
            <div>
              <p>Cadastrado por: {{ modalDetalhe.item.value.usuario_cadastro?.nome ?? '—' }}</p>
            </div>
            <div>
              <p>Aprovado por: {{ modalDetalhe.item.value.usuario_aprovacao?.nome ?? '—' }}</p>
            </div>
          </div>
        </div>

        <!-- MODO EDITAR -->
        <div
          v-else-if="modo === 'editar'"
          class="space-y-4"
        >
          <div class="grid grid-cols-2 gap-4">
            <AppFormField
              label="Valor Total (R$)"
              required
            >
              <AppInput
                v-model.number="formEdit.valor_total"
                type="number"
                min="0.01"
                step="0.01"
              />
            </AppFormField>

            <AppFormField
              label="Número de Parcelas"
              required
            >
              <AppInput
                v-model.number="formEdit.num_parcelas"
                type="number"
                min="1"
                step="1"
              />
            </AppFormField>
          </div>

          <div
            v-if="valorParcelaEdit > 0"
            class="p-3 rounded-lg bg-primary/5 border border-primary/20"
          >
            <p class="text-sm font-medium text-primary">
              {{ formEdit.num_parcelas }}x de {{ moeda(valorParcelaEdit) }}
            </p>
            <p class="text-xs text-stone-500 mt-1">
              Juros de 1,5% ao mês (Tabela Price)
            </p>
          </div>

          <AppFormField
            label="Data de Início do Desconto"
            required
          >
            <AppInput
              v-model="formEdit.data_inicio_desconto"
              type="date"
            />
          </AppFormField>

          <AppFormField
            label="Motivo / Justificativa"
            required
          >
            <AppTextarea
              v-model="formEdit.motivo"
              placeholder="Motivo do empréstimo..."
              :rows="3"
            />
          </AppFormField>
        </div>

        <!-- MODO EXCLUIR -->
        <div
          v-else-if="modo === 'excluir'"
          class="space-y-4"
        >
          <div class="p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
            <div class="flex items-center gap-2 text-red-700 dark:text-red-400 mb-2">
              <AppIcon
                name="i-lucide-alert-triangle"
                class="text-lg"
              />
              <span class="font-medium">Ação irreversível</span>
            </div>
            <p class="text-sm text-red-600 dark:text-red-400">
              Tem certeza que deseja excluir permanentemente este empréstimo de
              <strong>{{ moeda(modalDetalhe.item.value.valor_total) }}</strong>
              para <strong>{{ modalDetalhe.item.value.funcionario?.nome }}</strong>?
            </p>
            <p class="text-xs text-red-500 mt-2">
              Todas as parcelas associadas também serão excluídas.
            </p>
          </div>
        </div>
      </template>

      <!-- FOOTER -->
      <template #footer>
        <div class="flex justify-end gap-2">
          <!-- Modo VER -->
          <template v-if="modo === 'ver'">
            <AppButton
              v-if="isAdmin"
              icon="i-lucide-pencil"
              variant="soft"
              @click="entrarEdicao"
            >
              Editar
            </AppButton>
            <AppButton
              v-if="isAdmin"
              icon="i-lucide-trash-2"
              variant="soft"
              color="error"
              @click="modo = 'excluir'"
            >
              Excluir
            </AppButton>
          </template>

          <!-- Modo EDITAR -->
          <template v-else-if="modo === 'editar'">
            <AppButton
              variant="outline"
              color="neutral"
              @click="modo = 'ver'"
            >
              Cancelar
            </AppButton>
            <AppButton
              icon="i-lucide-check"
              :loading="salvando"
              @click="handleSalvar"
            >
              Salvar
            </AppButton>
          </template>

          <!-- Modo EXCLUIR -->
          <template v-else-if="modo === 'excluir'">
            <AppButton
              variant="outline"
              color="neutral"
              @click="modo = 'ver'"
            >
              Cancelar
            </AppButton>
            <AppButton
              icon="i-lucide-trash-2"
              color="error"
              variant="soft"
              @click="handleExcluir"
            >
              Excluir Permanentemente
            </AppButton>
          </template>
        </div>
      </template>
    </AppModal>
  </div>
</template>
