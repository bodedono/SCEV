<script setup lang="ts">
import type { Usuario, PerfilUsuario, Unidade } from '~/types'
import { validarCPF, formatarCPF, limparCPF } from '~/utils/cpf'

const props = defineProps<{
  usuario?: Usuario
  unidades: Unidade[]
}>()

const emit = defineEmits<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  salvar: [dados: any]
  cancelar: []
}>()

const isEdicao = computed(() => !!props.usuario)

const form = reactive({
  nome: props.usuario?.nome ?? '',
  email: props.usuario?.email ?? '',
  cpf: props.usuario?.cpf ? formatarCPF(props.usuario.cpf) : '',
  telefone: props.usuario?.telefone ?? '',
  data_nascimento: props.usuario?.data_nascimento ?? '',
  senha: '',
  perfil: (props.usuario?.perfil ?? 'OPERADOR') as PerfilUsuario,
  unidade_id: props.usuario?.unidade_id ?? (undefined as number | undefined),
  auto_confirmar: true
})

const cpfErro = ref('')

const onCpfInput = (event: Event) => {
  const input = event.target as HTMLInputElement
  form.cpf = formatarCPF(input.value)
  cpfErro.value = ''
}

const validarCpfField = () => {
  if (!form.cpf) {
    cpfErro.value = ''
    return true
  }
  const numeros = limparCPF(form.cpf)
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
  if (!validarCpfField()) return

  const dados = {
    ...form,
    cpf: limparCPF(form.cpf) || null
  }
  emit('salvar', dados)
}

// Reset form quando o usuario muda (abrir modal com dados diferentes)
watch(() => props.usuario, (usr) => {
  form.nome = usr?.nome ?? ''
  form.email = usr?.email ?? ''
  form.cpf = usr?.cpf ? formatarCPF(usr.cpf) : ''
  form.telefone = usr?.telefone ?? ''
  form.data_nascimento = usr?.data_nascimento ?? ''
  form.senha = ''
  form.perfil = usr?.perfil ?? 'OPERADOR'
  form.unidade_id = usr?.unidade_id ?? undefined
  form.auto_confirmar = true
  cpfErro.value = ''
})
</script>

<template>
  <form
    class="space-y-4"
    @submit.prevent="salvar"
  >
    <AppFormField
      label="Nome Completo"
      required
    >
      <AppInput
        v-model="form.nome"
        placeholder="Nome do usuário"
        class="w-full"
      />
    </AppFormField>

    <AppFormField
      label="Email"
      required
    >
      <AppInput
        v-model="form.email"
        type="email"
        placeholder="email@exemplo.com"
        class="w-full"
        :disabled="isEdicao"
      />
    </AppFormField>

    <AppFormField
      label="CPF"
      :error="cpfErro"
    >
      <AppInput
        :model-value="form.cpf"
        placeholder="000.000.000-00"
        icon="i-lucide-fingerprint"
        class="w-full"
        maxlength="14"
        @input="onCpfInput"
        @blur="validarCpfField"
      />
    </AppFormField>

    <div class="grid grid-cols-2 gap-4">
      <AppFormField label="Telefone">
        <AppInput
          v-model="form.telefone"
          type="tel"
          placeholder="(00) 00000-0000"
          icon="i-lucide-phone"
          class="w-full"
        />
      </AppFormField>

      <AppFormField label="Data de Nascimento">
        <AppInput
          v-model="form.data_nascimento"
          type="date"
          class="w-full"
        />
      </AppFormField>
    </div>

    <AppFormField
      v-if="!isEdicao"
      label="Senha"
      required
      hint="Mínimo 6 caracteres"
    >
      <AppInput
        v-model="form.senha"
        type="password"
        placeholder="Senha inicial"
        class="w-full"
      />
    </AppFormField>

    <div class="grid grid-cols-2 gap-4">
      <AppFormField
        label="Perfil"
        required
      >
        <AppSelect
          v-model="form.perfil"
          :items="perfilOptions"
        />
      </AppFormField>

      <AppFormField label="Unidade">
        <AppSelect
          v-model="form.unidade_id"
          :items="unidadeOptions"
          placeholder="Selecione"
        />
      </AppFormField>
    </div>

    <div
      v-if="form.perfil === 'GESTOR' && !form.unidade_id"
      class="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 text-sm text-yellow-700 dark:text-yellow-400 flex items-center gap-2"
    >
      <AppIcon name="i-lucide-alert-triangle" />
      Gestores devem ter uma unidade atribuída.
    </div>

    <div
      v-if="!isEdicao"
      class="flex items-center gap-3 p-3 rounded-lg"
      style="background-color: var(--bg-surface-hover);"
    >
      <AppSwitch v-model="form.auto_confirmar" />
      <div>
        <p class="text-sm font-medium">
          Confirmar email automaticamente
        </p>
        <p class="text-xs text-body">
          Pular verificação por email - o usuário pode logar imediatamente
        </p>
      </div>
    </div>

    <div class="flex justify-end gap-3 pt-4">
      <AppButton
        variant="outline"
        color="neutral"
        @click="emit('cancelar')"
      >
        Cancelar
      </AppButton>
      <AppButton
        type="submit"
        icon="i-lucide-check"
      >
        {{ isEdicao ? 'Atualizar' : 'Criar Usuário' }}
      </AppButton>
    </div>
  </form>
</template>
