<script setup lang="ts">
import type { Usuario } from '~/types'

const { usuario: currentUser } = useAuth()
const { unidades, listar: listarUnidades, criar: criarUnidade } = useUnidades()
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

const toast = useToast()

// Tabs
const tab = ref('usuarios')
const tabs = [
  { label: 'Usuários', value: 'usuarios', icon: 'i-lucide-users' },
  { label: 'Unidades', value: 'unidades', icon: 'i-lucide-building-2' }
]

// Busca
const busca = ref('')
const usuariosFiltrados = computed(() => {
  if (!busca.value) return usuarios.value
  const termo = busca.value.toLowerCase()
  return usuarios.value.filter(u =>
    u.nome.toLowerCase().includes(termo)
    || u.email.toLowerCase().includes(termo)
  )
})

// --- Modais de usuario ---
const modalUsuario = ref(false)
const modalExcluir = ref(false)
const modalResetSenha = ref(false)
const usuarioSelecionado = ref<Usuario | undefined>(undefined)
const salvandoUsuario = ref(false)
const novaSenha = ref('')

// --- Modal de unidade ---
const modalUnidade = ref(false)
const novaUnidade = reactive({ nome: '' })

// --- Handlers de usuario ---
const abrirCriar = () => {
  usuarioSelecionado.value = undefined
  modalUsuario.value = true
}

const abrirEditar = (usr: Usuario) => {
  usuarioSelecionado.value = usr
  modalUsuario.value = true
}

const handleSalvarUsuario = async (dados: any) => {
  salvandoUsuario.value = true
  try {
    if (usuarioSelecionado.value) {
      await atualizarUsuario(usuarioSelecionado.value.id, {
        nome: dados.nome,
        perfil: dados.perfil,
        unidade_id: dados.unidade_id || null
      })
      toast.add({ title: 'Usuário atualizado com sucesso', color: 'success' })
    } else {
      await criarUsuario(dados)
      toast.add({ title: 'Usuário criado com sucesso', color: 'success' })
    }
    modalUsuario.value = false
    await listarUsuarios()
  } catch (e: any) {
    toast.add({
      title: 'Erro',
      description: e.data?.message || e.message || 'Erro desconhecido',
      color: 'error'
    })
  } finally {
    salvandoUsuario.value = false
  }
}

const handleToggleAtivo = async (usr: Usuario) => {
  try {
    if (usr.ativo) {
      await desativarUsuario(usr.id)
      toast.add({ title: `${usr.nome} desativado`, color: 'warning' })
    } else {
      await reativarUsuario(usr.id)
      toast.add({ title: `${usr.nome} reativado`, color: 'success' })
    }
    await listarUsuarios()
  } catch (e: any) {
    toast.add({ title: 'Erro', description: e.data?.message || e.message, color: 'error' })
  }
}

const abrirExcluir = (usr: Usuario) => {
  usuarioSelecionado.value = usr
  modalExcluir.value = true
}

const handleExcluir = async () => {
  if (!usuarioSelecionado.value) return
  try {
    await excluirUsuario(usuarioSelecionado.value.id)
    toast.add({ title: 'Usuário excluído permanentemente', color: 'success' })
    modalExcluir.value = false
    await listarUsuarios()
  } catch (e: any) {
    toast.add({ title: 'Erro ao excluir', description: e.data?.message || e.message, color: 'error' })
  }
}

const abrirResetSenha = (usr: Usuario) => {
  usuarioSelecionado.value = usr
  novaSenha.value = ''
  modalResetSenha.value = true
}

const handleResetSenha = async () => {
  if (!usuarioSelecionado.value || novaSenha.value.length < 6) return
  try {
    await resetarSenha(usuarioSelecionado.value.id, novaSenha.value)
    toast.add({ title: 'Senha redefinida com sucesso', color: 'success' })
    modalResetSenha.value = false
  } catch (e: any) {
    toast.add({ title: 'Erro', description: e.data?.message || e.message, color: 'error' })
  }
}

// --- Handlers de unidade ---
const handleCriarUnidade = async () => {
  await criarUnidade(novaUnidade.nome)
  modalUnidade.value = false
  novaUnidade.nome = ''
  await listarUnidades()
}

// Mapa de perfil para label legivel
const perfilLabel = (perfil: string) => {
  const map: Record<string, string> = {
    ADMIN: 'Administrador',
    GESTOR: 'Gestor',
    OPERADOR: 'Operador'
  }
  return map[perfil] ?? perfil
}

const perfilColor = (perfil: string) => {
  const map: Record<string, string> = {
    ADMIN: 'error',
    GESTOR: 'warning',
    OPERADOR: 'info'
  }
  return map[perfil] ?? 'neutral'
}

onMounted(async () => {
  await Promise.all([listarUsuarios(), listarUnidades()])
})
</script>

<template>
  <div>
    <PageHeader titulo="Configurações" descricao="Gerenciar usuários e unidades" />

    <div class="flex gap-2 mb-6">
      <UButton
        v-for="t in tabs"
        :key="t.value"
        :icon="t.icon"
        :variant="tab === t.value ? 'solid' : 'ghost'"
        :color="tab === t.value ? 'primary' : 'neutral'"
        @click="tab = t.value"
      >
        {{ t.label }}
      </UButton>
    </div>

    <!-- ==================== USUARIOS ==================== -->
    <div v-if="tab === 'usuarios'">
      <!-- Toolbar -->
      <div class="flex items-center gap-4 mb-4">
        <UInput
          v-model="busca"
          placeholder="Buscar por nome ou email..."
          icon="i-lucide-search"
          class="flex-1 max-w-sm"
        />
        <div class="flex-1" />
        <UButton icon="i-lucide-plus" @click="abrirCriar">
          Novo Usuário
        </UButton>
      </div>

      <!-- Loading -->
      <div v-if="carregando" class="text-center py-12 text-gray-500">
        Carregando usuários...
      </div>

      <!-- Tabela -->
      <div v-else class="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th class="px-4 py-3 text-left font-medium text-gray-500">Nome</th>
              <th class="px-4 py-3 text-left font-medium text-gray-500">Email</th>
              <th class="px-4 py-3 text-left font-medium text-gray-500">Perfil</th>
              <th class="px-4 py-3 text-left font-medium text-gray-500">Unidade</th>
              <th class="px-4 py-3 text-left font-medium text-gray-500">Status</th>
              <th class="px-4 py-3 text-left font-medium text-gray-500">Ações</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100 dark:divide-gray-800">
            <tr v-if="usuariosFiltrados.length === 0">
              <td colspan="6" class="px-4 py-8 text-center text-gray-500">Nenhum usuário encontrado</td>
            </tr>
            <tr v-for="usr in usuariosFiltrados" :key="usr.id" class="hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <td class="px-4 py-3 font-medium">
                {{ usr.nome }}
                <span v-if="usr.id === currentUser?.id" class="ml-1 text-xs text-gray-400">(você)</span>
              </td>
              <td class="px-4 py-3 text-gray-500">{{ usr.email }}</td>
              <td class="px-4 py-3">
                <UBadge :color="perfilColor(usr.perfil)" variant="subtle" size="sm">
                  {{ perfilLabel(usr.perfil) }}
                </UBadge>
              </td>
              <td class="px-4 py-3 text-gray-500">{{ usr.unidade?.nome ?? 'Todas' }}</td>
              <td class="px-4 py-3">
                <UBadge :color="usr.ativo ? 'success' : 'error'" variant="subtle" size="sm">
                  {{ usr.ativo ? 'Ativo' : 'Inativo' }}
                </UBadge>
              </td>
              <td class="px-4 py-3">
                <div class="flex items-center gap-1">
                  <UButton
                    icon="i-lucide-pencil"
                    variant="ghost"
                    color="neutral"
                    size="xs"
                    title="Editar"
                    @click="abrirEditar(usr)"
                  />
                  <UButton
                    icon="i-lucide-key"
                    variant="ghost"
                    color="neutral"
                    size="xs"
                    title="Redefinir Senha"
                    @click="abrirResetSenha(usr)"
                  />
                  <UButton
                    :icon="usr.ativo ? 'i-lucide-user-x' : 'i-lucide-user-check'"
                    variant="ghost"
                    :color="usr.ativo ? 'warning' : 'success'"
                    size="xs"
                    :title="usr.ativo ? 'Desativar' : 'Reativar'"
                    @click="handleToggleAtivo(usr)"
                  />
                  <UButton
                    v-if="usr.id !== currentUser?.id"
                    icon="i-lucide-trash-2"
                    variant="ghost"
                    color="error"
                    size="xs"
                    title="Excluir"
                    @click="abrirExcluir(usr)"
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ==================== UNIDADES ==================== -->
    <div v-if="tab === 'unidades'">
      <div class="flex justify-end mb-4">
        <UButton icon="i-lucide-plus" @click="modalUnidade = true">Nova Unidade</UButton>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div
          v-for="unidade in unidades"
          :key="unidade.id"
          class="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 flex items-center gap-3"
        >
          <div class="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
            <UIcon name="i-lucide-building-2" />
          </div>
          <p class="flex-1 font-medium">{{ unidade.nome }}</p>
          <UBadge :color="unidade.ativo ? 'success' : 'error'" variant="subtle" size="xs">
            {{ unidade.ativo ? 'Ativa' : 'Inativa' }}
          </UBadge>
        </div>
      </div>

      <div v-if="unidades.length === 0" class="text-center py-12 text-gray-500">
        Nenhuma unidade cadastrada
      </div>
    </div>

    <!-- ==================== MODAIS ==================== -->

    <!-- Modal Criar/Editar Usuario -->
    <UModal v-model:open="modalUsuario">
      <template #header>
        <h3 class="text-lg font-semibold">
          {{ usuarioSelecionado ? 'Editar Usuário' : 'Novo Usuário' }}
        </h3>
      </template>
      <template #body>
        <UsuarioForm
          :usuario="usuarioSelecionado"
          :unidades="unidades"
          @salvar="handleSalvarUsuario"
          @cancelar="modalUsuario = false"
        />
      </template>
    </UModal>

    <!-- Modal Confirmar Exclusao -->
    <UModal v-model:open="modalExcluir">
      <template #header>
        <h3 class="text-lg font-semibold text-red-600">Excluir Usuário</h3>
      </template>
      <template #body>
        <div class="space-y-3">
          <p>Tem certeza que deseja excluir permanentemente <strong>{{ usuarioSelecionado?.nome }}</strong>?</p>
          <p class="text-sm text-gray-500">
            Esta ação remove o usuário do sistema de autenticação e não pode ser desfeita.
            Se o usuário tiver registros vinculados, será necessário desativá-lo em vez de excluir.
          </p>
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton variant="ghost" color="neutral" @click="modalExcluir = false">Cancelar</UButton>
          <UButton color="error" @click="handleExcluir">Excluir Permanentemente</UButton>
        </div>
      </template>
    </UModal>

    <!-- Modal Redefinir Senha -->
    <UModal v-model:open="modalResetSenha">
      <template #header>
        <h3 class="text-lg font-semibold">Redefinir Senha</h3>
      </template>
      <template #body>
        <div class="space-y-4">
          <p class="text-sm text-gray-500">
            Definir nova senha para <strong>{{ usuarioSelecionado?.nome }}</strong>
          </p>
          <UFormField label="Nova Senha" required hint="Mínimo 6 caracteres">
            <UInput v-model="novaSenha" type="password" placeholder="Nova senha" class="w-full" />
          </UFormField>
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton variant="ghost" color="neutral" @click="modalResetSenha = false">Cancelar</UButton>
          <UButton :disabled="novaSenha.length < 6" @click="handleResetSenha">Redefinir Senha</UButton>
        </div>
      </template>
    </UModal>

    <!-- Modal Nova Unidade -->
    <UModal v-model:open="modalUnidade">
      <template #header>
        <h3 class="text-lg font-semibold">Nova Unidade</h3>
      </template>
      <template #body>
        <UFormField label="Nome da Unidade" required>
          <UInput v-model="novaUnidade.nome" placeholder="Ex: Bode do Nô" />
        </UFormField>
      </template>
      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton variant="ghost" color="neutral" @click="modalUnidade = false">Cancelar</UButton>
          <UButton @click="handleCriarUnidade">Criar Unidade</UButton>
        </div>
      </template>
    </UModal>
  </div>
</template>
