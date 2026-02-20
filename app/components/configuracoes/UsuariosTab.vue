<script setup lang="ts">
import type { Usuario, PerfilUsuario } from '~/types'
import { formatarCPF, validarCPF, limparCPF } from '~/utils/cpf'

const { usuario: currentUser } = useAuth()
const { unidades, listar: listarUnidades } = useUnidades()
const {
  usuarios, carregando,
  listar: listarUsuarios,
  criar: criarUsuario,
  atualizar: atualizarUsuario,
  excluir: excluirUsuario,
  resetarSenha
} = useUsuarios()

const { comFeedback } = useToastFeedback()

// Busca
const busca = ref('')
const filtrados = computed(() => {
  if (!busca.value) return usuarios.value
  const termo = busca.value.toLowerCase()
  return usuarios.value.filter(u =>
    u.nome.toLowerCase().includes(termo)
    || u.email.toLowerCase().includes(termo)
    || (u.cpf && u.cpf.includes(termo.replace(/\D/g, '')))
  )
})

// Modal criar novo usuário
const modalCriar = ref(false)

// Modal ficha completa
const modalDetalhe = useModalState<Usuario>()
type ModoDetalhe = 'ver' | 'editar' | 'senha' | 'excluir'
const modo = ref<ModoDetalhe>('ver')

// Form edição
const formEdit = reactive({
  nome: '',
  email: '',
  cpf: '',
  perfil: 'OPERADOR' as PerfilUsuario,
  unidade_id: undefined as number | undefined,
  ativo: true
})
const cpfErro = ref('')
const salvando = ref(false)

// Senha
const novaSenha = ref('')

// Helpers
const perfilLabel = (perfil: string) => {
  const map: Record<string, string> = { ADMIN: 'Administrador', GESTOR: 'Gestor', OPERADOR: 'Operador' }
  return map[perfil] ?? perfil
}

type BadgeColor = 'error' | 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'neutral'
const perfilColor = (perfil: string): BadgeColor => {
  const map: Record<string, BadgeColor> = { ADMIN: 'error', GESTOR: 'warning', OPERADOR: 'info' }
  return map[perfil] ?? 'neutral'
}

const perfilOptions = [
  { label: 'Administrador', value: 'ADMIN' },
  { label: 'Gestor', value: 'GESTOR' },
  { label: 'Operador', value: 'OPERADOR' }
]

const unidadeOptions = computed(() => [
  { label: 'Todas (sem unidade)', value: undefined },
  ...unidades.value.map(u => ({ label: u.nome, value: u.id }))
])

// Abrir ficha
const abrirDetalhe = (usr: Usuario) => {
  modalDetalhe.abrir(usr)
  modo.value = 'ver'
  cpfErro.value = ''
  novaSenha.value = ''
}

// Entrar em modo edição
const entrarEdicao = () => {
  const usr = modalDetalhe.item.value
  if (!usr) return
  formEdit.nome = usr.nome
  formEdit.email = usr.email
  formEdit.cpf = usr.cpf ? formatarCPF(usr.cpf) : ''
  formEdit.perfil = usr.perfil
  formEdit.unidade_id = usr.unidade_id ?? undefined
  formEdit.ativo = usr.ativo
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
  if (!formEdit.nome.trim() || !formEdit.email.trim()) return
  if (!validarCpfField()) return

  salvando.value = true
  try {
    await comFeedback(
      () => atualizarUsuario(modalDetalhe.item.value!.id, {
        nome: formEdit.nome,
        cpf: limparCPF(formEdit.cpf) || null,
        perfil: formEdit.perfil,
        unidade_id: formEdit.unidade_id || null,
        ativo: formEdit.ativo
      }),
      'Usuário atualizado com sucesso',
      'Erro ao atualizar usuário'
    )
    await listarUsuarios()
    // Atualizar dados no modal
    const atualizado = usuarios.value.find(u => u.id === modalDetalhe.item.value?.id)
    if (atualizado) modalDetalhe.item.value = atualizado
    modo.value = 'ver'
  } finally {
    salvando.value = false
  }
}

// Criar novo
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleCriar = async (dados: any) => {
  const result = await comFeedback(
    () => criarUsuario(dados),
    'Usuário criado com sucesso',
    'Erro ao criar usuário'
  )
  if (result !== null) {
    modalCriar.value = false
    await listarUsuarios()
  }
}

// Excluir
const handleExcluir = async () => {
  const id = modalDetalhe.item.value?.id
  if (!id) return
  try {
    await excluirUsuario(id)
    useAppToast().add({ title: 'Usuário excluído permanentemente', color: 'success' })
    modalDetalhe.fechar()
    await listarUsuarios()
  } catch (err: unknown) {
    const e = err as Record<string, unknown> | undefined
    const data = e?.data as Record<string, unknown> | undefined
    const msg = (data?.message as string) || (e?.message as string) || 'Erro desconhecido'
    useAppToast().add({ title: 'Erro ao excluir', description: msg, color: 'error' })
  }
}

// Resetar senha
const handleResetSenha = async () => {
  if (!modalDetalhe.item.value || novaSenha.value.length < 6) return
  await comFeedback(
    () => resetarSenha(modalDetalhe.item.value!.id, novaSenha.value),
    'Senha redefinida com sucesso',
    'Erro ao redefinir senha'
  )
  modo.value = 'ver'
  novaSenha.value = ''
}

// Título dinâmico do modal
const tituloDetalhe = computed(() => {
  if (modo.value === 'editar') return 'Editar Usuário'
  if (modo.value === 'senha') return 'Redefinir Senha'
  if (modo.value === 'excluir') return 'Excluir Usuário'
  return modalDetalhe.item.value?.nome ?? 'Usuário'
})

const iconeDetalhe = computed(() => {
  if (modo.value === 'editar') return 'i-lucide-pencil'
  if (modo.value === 'senha') return 'i-lucide-key'
  if (modo.value === 'excluir') return 'i-lucide-trash-2'
  return 'i-lucide-user'
})

// Colunas
const columns = [
  { key: 'nome', label: 'Nome' },
  { key: 'email', label: 'Email', hideBelow: 'md' as const },
  { key: 'cpf', label: 'CPF', hideBelow: 'lg' as const },
  { key: 'perfil', label: 'Perfil' },
  { key: 'unidade', label: 'Unidade', hideBelow: 'md' as const },
  { key: 'status', label: 'Status' }
]

onMounted(async () => {
  await Promise.all([listarUsuarios(), listarUnidades()])
})
</script>

<template>
  <div>
    <!-- Toolbar -->
    <div class="flex items-center gap-3 mb-6">
      <AppInput
        v-model="busca"
        placeholder="Buscar por nome, email ou CPF..."
        icon="i-lucide-search"
        class="flex-1 max-w-sm"
      />
      <div class="flex-1" />
      <AppButton
        icon="i-lucide-plus"
        @click="modalCriar = true"
      >
        Novo Usuário
      </AppButton>
    </div>

    <!-- Tabela -->
    <DataTable
      :columns="columns"
      :data="filtrados"
      :loading="carregando"
      empty-text="Nenhum usuário encontrado"
    >
      <template #cell-nome="{ row }">
        <div class="flex items-center gap-2">
          <span class="font-medium flex-1 truncate">
            {{ row.nome }}
            <span
              v-if="row.id === currentUser?.id"
              class="ml-1 text-xs text-stone-400 dark:text-stone-500"
            >(você)</span>
          </span>
          <AppButton
            icon="i-lucide-eye"
            variant="ghost"
            color="neutral"
            size="xs"
            @click.stop="abrirDetalhe(row)"
          />
        </div>
      </template>
      <template #cell-email="{ row }">
        <span class="text-stone-500 dark:text-stone-400">{{ row.email }}</span>
      </template>
      <template #cell-cpf="{ row }">
        <span class="text-stone-500 dark:text-stone-400 font-mono text-xs">{{ row.cpf ? formatarCPF(row.cpf) : '—' }}</span>
      </template>
      <template #cell-perfil="{ row }">
        <AppBadge
          :color="perfilColor(row.perfil)"
          variant="subtle"
          size="sm"
        >
          {{ perfilLabel(row.perfil) }}
        </AppBadge>
      </template>
      <template #cell-unidade="{ row }">
        <span class="text-stone-500 dark:text-stone-400">{{ row.unidade?.nome ?? 'Todas' }}</span>
      </template>
      <template #cell-status="{ row }">
        <AppBadge
          :color="row.ativo ? 'success' : 'error'"
          variant="subtle"
          size="sm"
        >
          {{ row.ativo ? 'Ativo' : 'Inativo' }}
        </AppBadge>
      </template>
    </DataTable>

    <!-- Modal Criar Usuário -->
    <AppModal
      v-model:open="modalCriar"
      title="Novo Usuário"
      icon="i-lucide-user-plus"
    >
      <UsuarioForm
        :unidades="unidades"
        @salvar="handleCriar"
        @cancelar="modalCriar = false"
      />
    </AppModal>

    <!-- Modal Ficha Completa -->
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
                name="i-lucide-user"
                class="text-xl"
              />
            </div>
            <div class="flex-1">
              <h4 class="font-semibold text-lg">
                {{ modalDetalhe.item.value.nome }}
              </h4>
              <p class="text-sm text-stone-500 dark:text-stone-400">
                {{ modalDetalhe.item.value.email }}
              </p>
            </div>
            <div class="flex gap-2">
              <AppBadge
                :color="perfilColor(modalDetalhe.item.value.perfil)"
                variant="subtle"
              >
                {{ perfilLabel(modalDetalhe.item.value.perfil) }}
              </AppBadge>
              <AppBadge
                :color="modalDetalhe.item.value.ativo ? 'success' : 'error'"
                variant="subtle"
              >
                {{ modalDetalhe.item.value.ativo ? 'Ativo' : 'Inativo' }}
              </AppBadge>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3 p-4 rounded-lg bg-surface-area">
            <div>
              <p class="text-xs text-stone-400 dark:text-stone-500 mb-1">
                CPF
              </p>
              <p class="font-mono text-sm">
                {{ modalDetalhe.item.value.cpf ? formatarCPF(modalDetalhe.item.value.cpf) : '—' }}
              </p>
            </div>
            <div>
              <p class="text-xs text-stone-400 dark:text-stone-500 mb-1">
                Unidade
              </p>
              <p class="text-sm">
                {{ modalDetalhe.item.value.unidade?.nome ?? 'Todas' }}
              </p>
            </div>
          </div>
        </div>

        <!-- MODO EDITAR -->
        <div
          v-else-if="modo === 'editar'"
          class="space-y-4"
        >
          <AppFormField
            label="Nome Completo"
            required
          >
            <AppInput
              v-model="formEdit.nome"
              placeholder="Nome do usuário"
              class="w-full"
            />
          </AppFormField>

          <AppFormField
            label="Email"
            required
          >
            <AppInput
              v-model="formEdit.email"
              type="email"
              placeholder="email@exemplo.com"
              class="w-full"
            />
          </AppFormField>

          <AppFormField
            label="CPF"
            :error="cpfErro"
          >
            <AppInput
              :model-value="formEdit.cpf"
              placeholder="000.000.000-00"
              icon="i-lucide-fingerprint"
              class="w-full"
              maxlength="14"
              @input="onCpfInput"
              @blur="validarCpfField"
            />
          </AppFormField>

          <div class="grid grid-cols-2 gap-4">
            <AppFormField
              label="Perfil"
              required
            >
              <AppSelect
                v-model="formEdit.perfil"
                :items="perfilOptions"
              />
            </AppFormField>

            <AppFormField label="Unidade">
              <AppSelect
                v-model="formEdit.unidade_id"
                :items="unidadeOptions"
                placeholder="Selecione"
              />
            </AppFormField>
          </div>

          <div class="flex items-center gap-3 p-3 rounded-lg bg-surface-area">
            <AppSwitch v-model="formEdit.ativo" />
            <div>
              <p class="text-sm font-medium">
                Usuário ativo
              </p>
              <p class="text-xs text-stone-500 dark:text-stone-400">
                Usuários inativos não conseguem fazer login
              </p>
            </div>
          </div>
        </div>

        <!-- MODO SENHA -->
        <div
          v-else-if="modo === 'senha'"
          class="space-y-4"
        >
          <p class="text-sm text-stone-500 dark:text-stone-400">
            Definir nova senha para <strong>{{ modalDetalhe.item.value.nome }}</strong>
          </p>
          <AppFormField
            label="Nova Senha"
            required
            hint="Mínimo 6 caracteres"
          >
            <AppInput
              v-model="novaSenha"
              type="password"
              placeholder="Nova senha"
              class="w-full"
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
              Tem certeza que deseja excluir permanentemente <strong>{{ modalDetalhe.item.value.nome }}</strong>?
            </p>
            <p class="text-xs text-red-500 dark:text-red-500 mt-2">
              O usuário será removido do sistema de autenticação e todos os dados serão perdidos.
              Se houver registros vinculados (empréstimos, vales), a exclusão será bloqueada.
            </p>
          </div>
        </div>
      </template>

      <!-- FOOTER dinâmico -->
      <template #footer>
        <div class="flex justify-end gap-2">
          <!-- Modo VER -->
          <template v-if="modo === 'ver'">
            <AppButton
              icon="i-lucide-pencil"
              variant="soft"
              @click="entrarEdicao"
            >
              Editar
            </AppButton>
            <AppButton
              icon="i-lucide-key"
              variant="soft"
              color="warning"
              @click="modo = 'senha'; novaSenha = ''"
            >
              Redefinir Senha
            </AppButton>
            <AppButton
              v-if="modalDetalhe.item.value?.id !== currentUser?.id"
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

          <!-- Modo SENHA -->
          <template v-else-if="modo === 'senha'">
            <AppButton
              variant="outline"
              color="neutral"
              @click="modo = 'ver'"
            >
              Cancelar
            </AppButton>
            <AppButton
              icon="i-lucide-key"
              :disabled="novaSenha.length < 6"
              @click="handleResetSenha"
            >
              Confirmar
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
