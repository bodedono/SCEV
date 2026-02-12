<script setup lang="ts">
import type { Usuario } from '~/types'

const { usuario: currentUser } = useAuth()
const { unidades, listar: listarUnidades } = useUnidades()
const {
  usuarios, carregando,
  listar: listarUsuarios,
  criar: criarUsuario,
  atualizar: atualizarUsuario,
  excluir: excluirUsuario,
  desativar: desativarUsuario,
  reativar: reativarUsuario,
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
  )
})

// Modais
const modalUsuario = useModalState<Usuario>()
const modalExcluir = useModalState<Usuario>()
const modalResetSenha = useModalState<Usuario>()
const salvandoUsuario = ref(false)
const novaSenha = ref('')

// Helpers
const perfilLabel = (perfil: string) => {
  const map: Record<string, string> = { ADMIN: 'Administrador', GESTOR: 'Gestor', OPERADOR: 'Operador' }
  return map[perfil] ?? perfil
}

const perfilColor = (perfil: string) => {
  const map: Record<string, string> = { ADMIN: 'error', GESTOR: 'warning', OPERADOR: 'info' }
  return map[perfil] ?? 'neutral'
}

// Handlers
const handleSalvarUsuario = async (dados: any) => {
  salvandoUsuario.value = true
  try {
    if (modalUsuario.item.value) {
      await comFeedback(
        () => atualizarUsuario(modalUsuario.item.value!.id, {
          nome: dados.nome,
          perfil: dados.perfil,
          unidade_id: dados.unidade_id || null
        }),
        'Usuário atualizado com sucesso',
        'Erro ao atualizar usuário'
      )
    } else {
      await comFeedback(
        () => criarUsuario(dados),
        'Usuário criado com sucesso',
        'Erro ao criar usuário'
      )
    }
    modalUsuario.fechar()
    await listarUsuarios()
  } finally {
    salvandoUsuario.value = false
  }
}

const handleToggleAtivo = async (usr: Usuario) => {
  if (usr.ativo) {
    await comFeedback(() => desativarUsuario(usr.id), `${usr.nome} desativado`)
  } else {
    await comFeedback(() => reativarUsuario(usr.id), `${usr.nome} reativado`)
  }
  await listarUsuarios()
}

const handleExcluir = async () => {
  if (!modalExcluir.item.value) return
  await comFeedback(
    () => excluirUsuario(modalExcluir.item.value!.id),
    'Usuário excluído permanentemente',
    'Erro ao excluir'
  )
  modalExcluir.fechar()
  await listarUsuarios()
}

const abrirResetSenha = (usr: Usuario) => {
  novaSenha.value = ''
  modalResetSenha.abrir(usr)
}

const handleResetSenha = async () => {
  if (!modalResetSenha.item.value || novaSenha.value.length < 6) return
  await comFeedback(
    () => resetarSenha(modalResetSenha.item.value!.id, novaSenha.value),
    'Senha redefinida com sucesso',
    'Erro ao redefinir senha'
  )
  modalResetSenha.fechar()
}

// Colunas
const columns = [
  { key: 'nome', label: 'Nome' },
  { key: 'email', label: 'Email' },
  { key: 'perfil', label: 'Perfil' },
  { key: 'unidade', label: 'Unidade' },
  { key: 'status', label: 'Status' },
  { key: 'acoes', label: 'Ações' }
]

onMounted(async () => {
  await Promise.all([listarUsuarios(), listarUnidades()])
})
</script>

<template>
  <div>
    <!-- Toolbar -->
    <div class="flex items-center gap-3 mb-6">
      <UInput
        v-model="busca"
        placeholder="Buscar por nome ou email..."
        icon="i-lucide-search"
        class="flex-1 max-w-sm"
      />
      <div class="flex-1" />
      <UButton icon="i-lucide-plus" @click="modalUsuario.abrir()">
        Novo Usuário
      </UButton>
    </div>

    <!-- Tabela -->
    <DataTable :columns="columns" :data="filtrados" :loading="carregando" empty-text="Nenhum usuário encontrado">
      <template #cell-nome="{ row }">
        <span class="font-medium">
          {{ row.nome }}
          <span v-if="row.id === currentUser?.id" class="ml-1 text-xs text-gray-400">(você)</span>
        </span>
      </template>
      <template #cell-email="{ row }">
        <span class="text-gray-500">{{ row.email }}</span>
      </template>
      <template #cell-perfil="{ row }">
        <UBadge :color="perfilColor(row.perfil)" variant="subtle" size="sm">
          {{ perfilLabel(row.perfil) }}
        </UBadge>
      </template>
      <template #cell-unidade="{ row }">
        <span class="text-gray-500">{{ row.unidade?.nome ?? 'Todas' }}</span>
      </template>
      <template #cell-status="{ row }">
        <UBadge :color="row.ativo ? 'success' : 'error'" variant="subtle" size="sm">
          {{ row.ativo ? 'Ativo' : 'Inativo' }}
        </UBadge>
      </template>
      <template #cell-acoes="{ row }">
        <div class="flex items-center gap-1">
          <UTooltip text="Editar">
            <UButton icon="i-lucide-pencil" variant="ghost" color="neutral" size="xs" @click="modalUsuario.abrir(row)" />
          </UTooltip>
          <UTooltip text="Redefinir Senha">
            <UButton icon="i-lucide-key" variant="ghost" color="neutral" size="xs" @click="abrirResetSenha(row)" />
          </UTooltip>
          <UTooltip :text="row.ativo ? 'Desativar' : 'Reativar'">
            <UButton
              :icon="row.ativo ? 'i-lucide-user-x' : 'i-lucide-user-check'"
              variant="ghost"
              :color="row.ativo ? 'warning' : 'success'"
              size="xs"
              @click="handleToggleAtivo(row)"
            />
          </UTooltip>
          <UTooltip v-if="row.id !== currentUser?.id" text="Excluir">
            <UButton icon="i-lucide-trash-2" variant="ghost" color="error" size="xs" @click="modalExcluir.abrir(row)" />
          </UTooltip>
        </div>
      </template>
    </DataTable>

    <!-- Modal Criar/Editar -->
    <UModal v-model:open="modalUsuario.aberto.value">
      <template #header>
        <h3 class="text-lg font-semibold">
          {{ modalUsuario.item.value ? 'Editar Usuário' : 'Novo Usuário' }}
        </h3>
      </template>
      <template #body>
        <UsuarioForm
          :usuario="modalUsuario.item.value ?? undefined"
          :unidades="unidades"
          @salvar="handleSalvarUsuario"
          @cancelar="modalUsuario.fechar()"
        />
      </template>
    </UModal>

    <!-- Modal Excluir -->
    <ConfirmModal
      v-model="modalExcluir.aberto.value"
      title="Excluir Usuário"
      :message="`Tem certeza que deseja excluir permanentemente ${modalExcluir.item.value?.nome}?`"
      detail="Esta ação remove o usuário do sistema de autenticação e não pode ser desfeita. Se o usuário tiver registros vinculados, será necessário desativá-lo em vez de excluir."
      confirm-label="Excluir Permanentemente"
      confirm-icon="i-lucide-trash-2"
      destructive
      @confirm="handleExcluir"
    />

    <!-- Modal Redefinir Senha -->
    <UModal v-model:open="modalResetSenha.aberto.value">
      <template #header>
        <h3 class="text-lg font-semibold">Redefinir Senha</h3>
      </template>
      <template #body>
        <div class="space-y-4">
          <p class="text-sm text-gray-500">
            Definir nova senha para <strong>{{ modalResetSenha.item.value?.nome }}</strong>
          </p>
          <UFormField label="Nova Senha" required hint="Mínimo 6 caracteres">
            <UInput v-model="novaSenha" type="password" placeholder="Nova senha" class="w-full" />
          </UFormField>
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton variant="outline" color="neutral" @click="modalResetSenha.fechar()">Cancelar</UButton>
          <UButton :disabled="novaSenha.length < 6" icon="i-lucide-key" @click="handleResetSenha">Redefinir Senha</UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>
