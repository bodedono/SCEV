<script setup lang="ts">
import type { Usuario, PerfilUsuario, Unidade } from '~/types'

const props = defineProps<{
  usuario?: Usuario
  unidades: Unidade[]
}>()

const emit = defineEmits<{
  salvar: [dados: any]
  cancelar: []
}>()

const isEdicao = computed(() => !!props.usuario)

const form = reactive({
  nome: props.usuario?.nome ?? '',
  email: props.usuario?.email ?? '',
  senha: '',
  perfil: (props.usuario?.perfil ?? 'OPERADOR') as PerfilUsuario,
  unidade_id: props.usuario?.unidade_id ?? (undefined as number | undefined),
  auto_confirmar: true
})

const perfilOptions = [
  { label: 'Administrador', value: 'ADMIN' },
  { label: 'Gestor', value: 'GESTOR' },
  { label: 'Operador', value: 'OPERADOR' }
]

const unidadeOptions = computed(() => [
  { label: 'Todas (sem unidade)', value: undefined },
  ...props.unidades.map(u => ({ label: u.nome, value: u.id }))
])

const salvar = () => {
  if (!form.nome.trim() || !form.email.trim()) return
  if (!isEdicao.value && form.senha.length < 6) return
  emit('salvar', { ...form })
}

// Reset form quando o usuario muda (abrir modal com dados diferentes)
watch(() => props.usuario, (usr) => {
  form.nome = usr?.nome ?? ''
  form.email = usr?.email ?? ''
  form.senha = ''
  form.perfil = usr?.perfil ?? 'OPERADOR'
  form.unidade_id = usr?.unidade_id ?? undefined
  form.auto_confirmar = true
})
</script>

<template>
  <form class="space-y-4" @submit.prevent="salvar">
    <UFormField label="Nome Completo" required>
      <UInput v-model="form.nome" placeholder="Nome do usuário" class="w-full" />
    </UFormField>

    <UFormField label="Email" required>
      <UInput v-model="form.email" type="email" placeholder="email@exemplo.com" class="w-full" :disabled="isEdicao" />
    </UFormField>

    <UFormField v-if="!isEdicao" label="Senha" required hint="Mínimo 6 caracteres">
      <UInput v-model="form.senha" type="password" placeholder="Senha inicial" class="w-full" />
    </UFormField>

    <div class="grid grid-cols-2 gap-4">
      <UFormField label="Perfil" required>
        <USelect v-model="form.perfil" :items="perfilOptions" />
      </UFormField>

      <UFormField label="Unidade">
        <USelect v-model="form.unidade_id" :items="unidadeOptions" placeholder="Selecione" />
      </UFormField>
    </div>

    <div v-if="form.perfil === 'GESTOR' && !form.unidade_id" class="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 text-sm text-yellow-700 dark:text-yellow-400 flex items-center gap-2">
      <UIcon name="i-lucide-alert-triangle" />
      Gestores devem ter uma unidade atribuída.
    </div>

    <div v-if="!isEdicao" class="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
      <USwitch v-model="form.auto_confirmar" />
      <div>
        <p class="text-sm font-medium">Confirmar email automaticamente</p>
        <p class="text-xs text-gray-500">Pular verificação por email - o usuário pode logar imediatamente</p>
      </div>
    </div>

    <div class="flex justify-end gap-2 pt-4">
      <UButton variant="ghost" color="neutral" @click="emit('cancelar')">
        Cancelar
      </UButton>
      <UButton type="submit">
        {{ isEdicao ? 'Atualizar' : 'Criar Usuário' }}
      </UButton>
    </div>
  </form>
</template>
