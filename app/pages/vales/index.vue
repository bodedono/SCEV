<script setup lang="ts">
import type { Vale, FormaDesconto } from '~/types'

const { isAdmin, podeCadastrar } = useAuth()
const { moeda, data } = useFormatters()
const { vales, carregando, listar, atualizar, excluir } = useVales()
const { comFeedback } = useToastFeedback()

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
  return vales.value.filter((v) => {
    const matchBusca = !busca.value
      || v.funcionario?.nome.toLowerCase().includes(busca.value.toLowerCase())
      || v.comentario.toLowerCase().includes(busca.value.toLowerCase())
    const matchStatus = !statusFiltro.value || v.status === statusFiltro.value
    return matchBusca && matchStatus
  })
})

const columns = [
  { key: 'funcionario', label: 'Funcionário' },
  { key: 'comentario', label: 'Motivo', hideBelow: 'md' as const },
  { key: 'valor', label: 'Valor' },
  { key: 'desconto', label: 'Desconto', hideBelow: 'md' as const },
  { key: 'data_ocorrido', label: 'Data', hideBelow: 'lg' as const },
  { key: 'status', label: 'Status' }
]

// Modal detalhe
const modalDetalhe = useModalState<Vale>()
type ModoDetalhe = 'ver' | 'editar' | 'excluir'
const modo = ref<ModoDetalhe>('ver')
const salvando = ref(false)

// Form edição
const formEdit = reactive({
  valor: 0,
  comentario: '',
  referencia: '',
  data_ocorrido: '',
  forma_desconto: 'INTEGRAL' as FormaDesconto,
  num_parcelas: 1
})

const formaDescontoOptions = [
  { label: 'Integral (desconto único)', value: 'INTEGRAL' },
  { label: 'Parcelas', value: 'PARCELAS' }
]

// Abrir detalhe
const abrirDetalhe = (vale: Vale) => {
  modalDetalhe.abrir(vale)
  modo.value = 'ver'
}

// Entrar edição
const entrarEdicao = () => {
  const vale = modalDetalhe.item.value
  if (!vale) return
  formEdit.valor = vale.valor
  formEdit.comentario = vale.comentario
  formEdit.referencia = vale.referencia ?? ''
  formEdit.data_ocorrido = vale.data_ocorrido
  formEdit.forma_desconto = vale.forma_desconto
  formEdit.num_parcelas = vale.num_parcelas
  modo.value = 'editar'
}

// Salvar edição
const handleSalvar = async () => {
  if (!modalDetalhe.item.value) return
  salvando.value = true
  try {
    const result = await comFeedback(
      () => atualizar(modalDetalhe.item.value!.id, {
        valor: formEdit.valor,
        comentario: formEdit.comentario,
        referencia: formEdit.referencia || null,
        data_ocorrido: formEdit.data_ocorrido,
        forma_desconto: formEdit.forma_desconto,
        num_parcelas: formEdit.forma_desconto === 'PARCELAS' ? formEdit.num_parcelas : 1
      }),
      'Vale atualizado com sucesso',
      'Erro ao atualizar vale'
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
    'Vale excluído permanentemente',
    'Erro ao excluir vale'
  )
  if (result !== null) {
    modalDetalhe.fechar()
    await listar()
  }
}

// Título e ícone dinâmicos
const tituloDetalhe = computed(() => {
  if (modo.value === 'editar') return 'Editar Vale'
  if (modo.value === 'excluir') return 'Excluir Vale'
  return 'Detalhes do Vale'
})

const iconeDetalhe = computed(() => {
  if (modo.value === 'editar') return 'i-lucide-pencil'
  if (modo.value === 'excluir') return 'i-lucide-trash-2'
  return 'i-lucide-receipt'
})

onMounted(() => listar())
</script>

<template>
  <div>
    <PageHeader
      titulo="Vales"
      descricao="Gerenciamento de vales"
    >
      <template #acoes>
        <AppButton
          v-if="podeCadastrar"
          icon="i-lucide-plus"
          to="/vales/novo"
        >
          Novo Vale
        </AppButton>
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

    <DataTable
      :columns="columns"
      :data="filtrados"
      :loading="carregando"
      empty-text="Nenhum vale encontrado"
    >
      <template #cell-funcionario="{ row }">
        <div class="flex items-center gap-2">
          <NuxtLink
            :to="`/funcionarios/${row.funcionario_id}`"
            class="font-medium hover:text-primary transition-colors flex-1 truncate"
          >
            {{ row.funcionario?.nome }}
          </NuxtLink>
          <AppButton
            icon="i-lucide-eye"
            variant="ghost"
            color="neutral"
            size="xs"
            @click.stop="abrirDetalhe(row)"
          />
        </div>
      </template>
      <template #cell-comentario="{ row }">
        <span class="text-stone-500 truncate max-w-xs block">{{ row.comentario }}</span>
      </template>
      <template #cell-valor="{ row }">
        <span class="font-medium">{{ moeda(row.valor) }}</span>
      </template>
      <template #cell-desconto="{ row }">
        <span class="text-stone-500">{{ row.forma_desconto === 'INTEGRAL' ? 'Integral' : `${row.num_parcelas}x` }}</span>
      </template>
      <template #cell-data_ocorrido="{ row }">
        <span class="text-stone-500">{{ data(row.data_ocorrido) }}</span>
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
                name="i-lucide-receipt"
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
                Valor
              </p>
              <p class="text-sm font-bold">
                {{ moeda(modalDetalhe.item.value.valor) }}
              </p>
            </div>
            <div>
              <p class="text-xs text-stone-400 mb-1">
                Forma de Desconto
              </p>
              <p class="text-sm font-medium">
                {{ modalDetalhe.item.value.forma_desconto === 'INTEGRAL' ? 'Integral' : `${modalDetalhe.item.value.num_parcelas}x parcelas` }}
              </p>
            </div>
            <div>
              <p class="text-xs text-stone-400 mb-1">
                Data do Ocorrido
              </p>
              <p class="text-sm">
                {{ data(modalDetalhe.item.value.data_ocorrido) }}
              </p>
            </div>
          </div>

          <div class="p-3 rounded-lg bg-surface-area">
            <p class="text-xs text-stone-400 mb-1">
              Comentário / Motivo
            </p>
            <p class="text-sm">
              {{ modalDetalhe.item.value.comentario }}
            </p>
          </div>

          <div
            v-if="modalDetalhe.item.value.referencia"
            class="p-3 rounded-lg bg-surface-area"
          >
            <p class="text-xs text-stone-400 mb-1">
              Referência
            </p>
            <p class="text-sm">
              {{ modalDetalhe.item.value.referencia }}
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
              label="Valor (R$)"
              required
            >
              <AppInput
                v-model.number="formEdit.valor"
                type="number"
                min="0.01"
                step="0.01"
              />
            </AppFormField>

            <AppFormField
              label="Data do Ocorrido"
              required
            >
              <AppInput
                v-model="formEdit.data_ocorrido"
                type="date"
              />
            </AppFormField>
          </div>

          <AppFormField
            label="Comentário / Motivo"
            required
          >
            <AppTextarea
              v-model="formEdit.comentario"
              placeholder="Descreva o que aconteceu..."
              :rows="3"
            />
          </AppFormField>

          <AppFormField
            label="Referência"
            hint="Opcional"
          >
            <AppInput
              v-model="formEdit.referencia"
              placeholder="Ex: Comanda 1234, Mesa 15"
            />
          </AppFormField>

          <AppFormField
            label="Forma de Desconto"
            required
          >
            <AppSelect
              v-model="formEdit.forma_desconto"
              :items="formaDescontoOptions"
            />
          </AppFormField>

          <AppFormField
            v-if="formEdit.forma_desconto === 'PARCELAS'"
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
              Tem certeza que deseja excluir permanentemente este vale de
              <strong>{{ moeda(modalDetalhe.item.value.valor) }}</strong>
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
