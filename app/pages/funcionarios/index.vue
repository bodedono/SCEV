<script setup lang="ts">
import type { Funcionario, Emprestimo, Vale } from '~/types'
import { formatarCPF, validarCPF, limparCPF } from '~/utils/cpf'

const { isAdmin, isGestor, unidadeId } = useAuth()
const { moeda, data: formatarData } = useFormatters()
const { funcionarios, carregando, listar, buscarComSaldo, atualizar, desativar, excluir } = useFuncionarios()
const { unidades, listar: listarUnidades } = useUnidades()
const { comFeedback } = useToastFeedback()

// Busca e filtros
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
      || (f.cpf && f.cpf.includes(busca.value.replace(/\D/g, '')))
    const matchUnidade = !unidadeFiltro.value || f.unidade_id === unidadeFiltro.value
    return matchBusca && matchUnidade
  })
})

const columns = [
  { key: 'nome', label: 'Nome' },
  { key: 'cpf', label: 'CPF' },
  { key: 'matricula', label: 'Matrícula' },
  { key: 'unidade', label: 'Unidade' },
  { key: 'cargo', label: 'Cargo' },
  { key: 'status', label: 'Status' },
  { key: 'saldo_devedor', label: 'Saldo Devedor' }
]

// Criar funcionário
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleCriar = async (dados: any) => {
  const { criar } = useFuncionarios()
  await comFeedback(
    () => criar(dados),
    'Funcionário cadastrado com sucesso',
    'Erro ao cadastrar funcionário'
  )
  modalCadastro.value = false
  await recarregar()
}

// Modal ficha completa
const modalDetalhe = useModalState<Funcionario>()
type ModoDetalhe = 'ver' | 'editar' | 'desativar' | 'excluir'
const modo = ref<ModoDetalhe>('ver')
const carregandoDetalhe = ref(false)
const emprestimos = ref<Emprestimo[]>([])
const vales = ref<Vale[]>([])
const salvando = ref(false)

// Form edição
const formEdit = reactive({
  nome: '',
  cpf: '',
  matricula: '',
  cargo: '',
  unidade_id: undefined as number | undefined,
  data_admissao: '',
  ativo: true
})
const cpfErro = ref('')

const unidadeEditOptions = computed(() =>
  unidades.value.map(u => ({ label: u.nome, value: u.id }))
)

// Abrir ficha
const abrirDetalhe = async (func: Funcionario) => {
  modalDetalhe.abrir(func)
  modo.value = 'ver'
  cpfErro.value = ''
  carregandoDetalhe.value = true

  try {
    const supabase = useSupabaseClient()

    // Buscar com saldo
    const completo = await buscarComSaldo(func.id)
    modalDetalhe.item.value = completo

    // Buscar empréstimos
    const { data: empData } = await supabase
      .from('emprestimos')
      .select('*')
      .eq('funcionario_id', func.id)
      .order('created_at', { ascending: false })
    emprestimos.value = (empData ?? []) as Emprestimo[]

    // Buscar vales
    const { data: valeData } = await supabase
      .from('vales')
      .select('*')
      .eq('funcionario_id', func.id)
      .order('created_at', { ascending: false })
    vales.value = (valeData ?? []) as Vale[]
  } finally {
    carregandoDetalhe.value = false
  }
}

// Entrar em modo edição
const entrarEdicao = () => {
  const func = modalDetalhe.item.value
  if (!func) return
  formEdit.nome = func.nome
  formEdit.cpf = func.cpf ? formatarCPF(func.cpf) : ''
  formEdit.matricula = func.matricula
  formEdit.cargo = func.cargo
  formEdit.unidade_id = func.unidade_id
  formEdit.data_admissao = func.data_admissao
  formEdit.ativo = func.ativo
  cpfErro.value = ''
  modo.value = 'editar'
}

// CPF handlers
const onCpfInput = (event: Event) => {
  const input = event.target as HTMLInputElement
  formEdit.cpf = formatarCPF(input.value)
  cpfErro.value = ''
}

const validarCpfField = () => {
  if (!formEdit.cpf) {
    cpfErro.value = ''
    return true
  }
  const numeros = limparCPF(formEdit.cpf)
  if (numeros.length > 0 && numeros.length < 11) {
    cpfErro.value = 'CPF incompleto'
    return false
  }
  if (numeros.length === 11 && !validarCPF(numeros)) {
    cpfErro.value = 'CPF inválido'
    return false
  }
  cpfErro.value = ''
  return true
}

// Salvar edição
const handleSalvar = async () => {
  if (!modalDetalhe.item.value) return
  if (!formEdit.nome.trim() || !formEdit.matricula.trim()) return
  if (!validarCpfField()) return

  salvando.value = true
  try {
    await comFeedback(
      () => atualizar(modalDetalhe.item.value!.id, {
        nome: formEdit.nome,
        cpf: limparCPF(formEdit.cpf) || null,
        matricula: formEdit.matricula,
        cargo: formEdit.cargo,
        unidade_id: formEdit.unidade_id,
        data_admissao: formEdit.data_admissao,
        ativo: formEdit.ativo
      }),
      'Funcionário atualizado com sucesso',
      'Erro ao atualizar funcionário'
    )
    await recarregar()
    // Recarregar dados no modal
    const atualizado = await buscarComSaldo(modalDetalhe.item.value!.id)
    modalDetalhe.item.value = atualizado
    modo.value = 'ver'
  } finally {
    salvando.value = false
  }
}

// Desativar
const handleDesativar = async () => {
  if (!modalDetalhe.item.value) return
  await comFeedback(
    () => desativar(modalDetalhe.item.value!.id),
    'Funcionário desativado',
    'Erro ao desativar funcionário'
  )
  modalDetalhe.fechar()
  await recarregar()
}

// Excluir permanentemente
const handleExcluir = async () => {
  if (!modalDetalhe.item.value) return
  await comFeedback(
    () => excluir(modalDetalhe.item.value!.id),
    'Funcionário excluído permanentemente',
    'Erro ao excluir funcionário'
  )
  modalDetalhe.fechar()
  await recarregar()
}

// Helpers
const recarregar = () => listar(isGestor.value ? unidadeId.value ?? undefined : undefined)

const tituloDetalhe = computed(() => {
  if (modo.value === 'editar') return 'Editar Funcionário'
  if (modo.value === 'desativar') return 'Desativar Funcionário'
  if (modo.value === 'excluir') return 'Excluir Funcionário'
  return modalDetalhe.item.value?.nome ?? 'Funcionário'
})

const iconeDetalhe = computed(() => {
  if (modo.value === 'editar') return 'i-lucide-pencil'
  if (modo.value === 'desativar') return 'i-lucide-user-x'
  if (modo.value === 'excluir') return 'i-lucide-trash-2'
  return 'i-lucide-user'
})

onMounted(async () => {
  await Promise.all([recarregar(), listarUnidades()])
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
      search-placeholder="Buscar por nome, matrícula ou CPF..."
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
    >
      <template #cell-nome="{ row }">
        <div class="flex items-center gap-2">
          <span class="font-medium flex-1 truncate">{{ row.nome }}</span>
          <UButton
            icon="i-lucide-eye"
            variant="ghost"
            color="neutral"
            size="xs"
            @click.stop="abrirDetalhe(row)"
          />
        </div>
      </template>
      <template #cell-cpf="{ row }">
        <span class="text-gray-500 font-mono text-xs">{{ row.cpf ? formatarCPF(row.cpf) : '—' }}</span>
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
    </DataTable>

    <!-- Modal Cadastrar -->
    <AppModal
      v-model:open="modalCadastro"
      title="Novo Funcionário"
      icon="i-lucide-user-plus"
    >
      <FuncionarioForm
        :unidades="unidades"
        @salvar="handleCriar"
        @cancelar="modalCadastro = false"
      />
    </AppModal>

    <!-- Modal Ficha Completa -->
    <AppModal
      v-model:open="modalDetalhe.aberto.value"
      :title="tituloDetalhe"
      :icon="iconeDetalhe"
      :destructive="modo === 'desativar' || modo === 'excluir'"
      size="lg"
    >
      <template v-if="modalDetalhe.item.value">
        <!-- Carregando detalhes -->
        <div
          v-if="carregandoDetalhe"
          class="flex items-center justify-center py-8 text-gray-400"
        >
          <UIcon
            name="i-lucide-loader-2"
            class="animate-spin text-2xl mr-2"
          />
          Carregando...
        </div>

        <!-- MODO VER -->
        <div
          v-else-if="modo === 'ver'"
          class="space-y-5"
        >
          <!-- Cabeçalho -->
          <div class="flex items-center gap-4">
            <UAvatar
              :label="modalDetalhe.item.value.nome.charAt(0)"
              size="lg"
            />
            <div class="flex-1">
              <h4 class="font-semibold text-lg">
                {{ modalDetalhe.item.value.nome }}
              </h4>
              <p class="text-sm text-gray-500">
                {{ modalDetalhe.item.value.cargo }} · {{ modalDetalhe.item.value.unidade?.nome }}
              </p>
            </div>
            <UBadge
              :color="modalDetalhe.item.value.ativo ? 'success' : 'error'"
              variant="subtle"
            >
              {{ modalDetalhe.item.value.ativo ? 'Ativo' : 'Inativo' }}
            </UBadge>
          </div>

          <!-- Dados -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
            <div>
              <p class="text-xs text-gray-400 mb-1">
                CPF
              </p>
              <p class="font-mono text-sm">
                {{ modalDetalhe.item.value.cpf ? formatarCPF(modalDetalhe.item.value.cpf) : '—' }}
              </p>
            </div>
            <div>
              <p class="text-xs text-gray-400 mb-1">
                Matrícula
              </p>
              <p class="text-sm font-medium">
                {{ modalDetalhe.item.value.matricula }}
              </p>
            </div>
            <div>
              <p class="text-xs text-gray-400 mb-1">
                Admissão
              </p>
              <p class="text-sm">
                {{ formatarData(modalDetalhe.item.value.data_admissao) }}
              </p>
            </div>
            <div>
              <p class="text-xs text-gray-400 mb-1">
                Saldo Devedor
              </p>
              <p
                class="text-sm font-bold"
                :class="(modalDetalhe.item.value.saldo_devedor ?? 0) > 0 ? 'text-red-600' : 'text-green-600'"
              >
                {{ moeda(modalDetalhe.item.value.saldo_devedor ?? 0) }}
              </p>
            </div>
          </div>

          <!-- Empréstimos -->
          <div>
            <h5 class="text-sm font-semibold mb-2 flex items-center gap-1.5">
              <UIcon
                name="i-lucide-banknote"
                class="text-blue-500"
              />
              Empréstimos
            </h5>
            <div
              v-if="emprestimos.length === 0"
              class="text-xs text-gray-400 text-center py-3"
            >
              Nenhum empréstimo registrado
            </div>
            <div
              v-else
              class="space-y-2"
            >
              <div
                v-for="emp in emprestimos"
                :key="emp.id"
                class="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800 text-sm"
              >
                <div>
                  <span class="font-medium">{{ moeda(emp.valor_total) }}</span>
                  <span class="text-gray-400 ml-2">{{ emp.num_parcelas }}x {{ moeda(emp.valor_parcela) }}</span>
                </div>
                <StatusBadge :status="emp.status" />
              </div>
            </div>
          </div>

          <!-- Vales -->
          <div>
            <h5 class="text-sm font-semibold mb-2 flex items-center gap-1.5">
              <UIcon
                name="i-lucide-receipt"
                class="text-orange-500"
              />
              Vales
            </h5>
            <div
              v-if="vales.length === 0"
              class="text-xs text-gray-400 text-center py-3"
            >
              Nenhum vale registrado
            </div>
            <div
              v-else
              class="space-y-2"
            >
              <div
                v-for="vale in vales"
                :key="vale.id"
                class="flex items-center justify-between p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800 text-sm"
              >
                <div>
                  <span class="font-medium">{{ moeda(vale.valor) }}</span>
                  <span class="text-gray-400 ml-2 truncate max-w-[200px] inline-block align-bottom">{{ vale.comentario }}</span>
                </div>
                <StatusBadge :status="vale.status" />
              </div>
            </div>
          </div>
        </div>

        <!-- MODO EDITAR -->
        <div
          v-else-if="modo === 'editar'"
          class="space-y-4"
        >
          <UFormField
            label="Nome Completo"
            required
          >
            <UInput
              v-model="formEdit.nome"
              placeholder="Nome do funcionário"
              class="w-full"
            />
          </UFormField>

          <UFormField
            label="CPF"
            :error="cpfErro"
          >
            <UInput
              :model-value="formEdit.cpf"
              placeholder="000.000.000-00"
              icon="i-lucide-fingerprint"
              class="w-full"
              maxlength="14"
              @input="onCpfInput"
              @blur="validarCpfField"
            />
          </UFormField>

          <div class="grid grid-cols-2 gap-4">
            <UFormField
              label="Matrícula"
              required
            >
              <UInput
                v-model="formEdit.matricula"
                placeholder="Ex: 12345"
              />
            </UFormField>

            <UFormField
              label="Cargo/Função"
              required
            >
              <UInput
                v-model="formEdit.cargo"
                placeholder="Ex: Garçom"
              />
            </UFormField>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <UFormField
              label="Unidade"
              required
            >
              <USelect
                v-model="formEdit.unidade_id"
                :items="unidadeEditOptions"
                placeholder="Selecione a unidade"
              />
            </UFormField>

            <UFormField
              label="Data de Admissão"
              required
            >
              <UInput
                v-model="formEdit.data_admissao"
                type="date"
              />
            </UFormField>
          </div>

          <div class="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
            <USwitch v-model="formEdit.ativo" />
            <div>
              <p class="text-sm font-medium">
                Funcionário ativo
              </p>
              <p class="text-xs text-gray-500">
                Funcionários inativos não aparecem em novos lançamentos
              </p>
            </div>
          </div>
        </div>

        <!-- MODO DESATIVAR -->
        <div
          v-else-if="modo === 'desativar'"
          class="space-y-4"
        >
          <div class="p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
            <div class="flex items-center gap-2 text-red-700 dark:text-red-400 mb-2">
              <UIcon
                name="i-lucide-alert-triangle"
                class="text-lg"
              />
              <span class="font-medium">Desativar funcionário</span>
            </div>
            <p class="text-sm text-red-600 dark:text-red-400">
              Tem certeza que deseja desativar <strong>{{ modalDetalhe.item.value.nome }}</strong>?
            </p>
            <p class="text-xs text-red-500 mt-2">
              O funcionário não aparecerá mais em novos empréstimos e vales.
              Parcelas pendentes continuarão ativas.
            </p>
          </div>
        </div>

        <!-- MODO EXCLUIR -->
        <div
          v-else-if="modo === 'excluir'"
          class="space-y-4"
        >
          <div class="p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
            <div class="flex items-center gap-2 text-red-700 dark:text-red-400 mb-2">
              <UIcon
                name="i-lucide-trash-2"
                class="text-lg"
              />
              <span class="font-medium">Exclusão permanente</span>
            </div>
            <p class="text-sm text-red-600 dark:text-red-400">
              Tem certeza que deseja excluir <strong>{{ modalDetalhe.item.value.nome }}</strong> permanentemente?
            </p>
            <p class="text-xs text-red-500 mt-2">
              Esta ação é irreversível. Todos os dados do funcionário serão apagados do banco de dados,
              incluindo o histórico de empréstimos e vales associados.
            </p>
          </div>
        </div>
      </template>

      <!-- FOOTER dinâmico -->
      <template #footer>
        <div class="flex justify-end gap-2">
          <!-- Modo VER -->
          <template v-if="modo === 'ver' && !carregandoDetalhe">
            <UButton
              v-if="isAdmin"
              icon="i-lucide-pencil"
              variant="soft"
              @click="entrarEdicao"
            >
              Editar
            </UButton>
            <UButton
              v-if="isAdmin && modalDetalhe.item.value?.ativo"
              icon="i-lucide-user-x"
              variant="soft"
              color="error"
              @click="modo = 'desativar'"
            >
              Desativar
            </UButton>
            <UButton
              v-if="isAdmin"
              icon="i-lucide-trash-2"
              variant="soft"
              color="error"
              @click="modo = 'excluir'"
            >
              Excluir
            </UButton>
          </template>

          <!-- Modo EDITAR -->
          <template v-else-if="modo === 'editar'">
            <UButton
              variant="outline"
              color="neutral"
              @click="modo = 'ver'"
            >
              Cancelar
            </UButton>
            <UButton
              icon="i-lucide-check"
              :loading="salvando"
              @click="handleSalvar"
            >
              Salvar
            </UButton>
          </template>

          <!-- Modo DESATIVAR -->
          <template v-else-if="modo === 'desativar'">
            <UButton
              variant="outline"
              color="neutral"
              @click="modo = 'ver'"
            >
              Cancelar
            </UButton>
            <UButton
              icon="i-lucide-user-x"
              color="error"
              variant="soft"
              @click="handleDesativar"
            >
              Confirmar Desativação
            </UButton>
          </template>

          <!-- Modo EXCLUIR -->
          <template v-else-if="modo === 'excluir'">
            <UButton
              variant="outline"
              color="neutral"
              @click="modo = 'ver'"
            >
              Cancelar
            </UButton>
            <UButton
              icon="i-lucide-trash-2"
              color="error"
              @click="handleExcluir"
            >
              Excluir Permanentemente
            </UButton>
          </template>
        </div>
      </template>
    </AppModal>
  </div>
</template>
