<script setup lang="ts">
import type { Funcionario, Unidade } from '~/types'
import { validarCPF, formatarCPF, limparCPF } from '~/utils/cpf'

const props = defineProps<{
  funcionario?: Funcionario
  unidades: Unidade[]
}>()

const emit = defineEmits<{
  salvar: [dados: Partial<Funcionario>]
  cancelar: []
}>()

const form = reactive({
  nome: props.funcionario?.nome ?? '',
  cpf: props.funcionario?.cpf ? formatarCPF(props.funcionario.cpf) : '',
  matricula: props.funcionario?.matricula ?? '',
  unidade_id: props.funcionario?.unidade_id ?? undefined as number | undefined,
  cargo: props.funcionario?.cargo ?? '',
  data_admissao: props.funcionario?.data_admissao ?? '',
  ativo: props.funcionario?.ativo ?? true
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

const unidadeOptions = computed(() =>
  props.unidades.map(u => ({ label: u.nome, value: u.id }))
)

const salvar = () => {
  if (!validarCpfField()) return
  emit('salvar', { ...form, cpf: limparCPF(form.cpf) || null })
}
</script>

<template>
  <form
    class="space-y-4"
    @submit.prevent="salvar"
  >
    <UFormField
      label="Nome Completo"
      required
    >
      <UInput
        v-model="form.nome"
        placeholder="Nome do funcionário"
        class="w-full"
      />
    </UFormField>

    <UFormField
      label="CPF"
      :error="cpfErro"
    >
      <UInput
        :model-value="form.cpf"
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
          v-model="form.matricula"
          placeholder="Ex: 12345"
        />
      </UFormField>

      <UFormField
        label="Cargo/Função"
        required
      >
        <UInput
          v-model="form.cargo"
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
          v-model="form.unidade_id"
          :items="unidadeOptions"
          placeholder="Selecione a unidade"
        />
      </UFormField>

      <UFormField
        label="Data de Admissão"
        required
      >
        <UInput
          v-model="form.data_admissao"
          type="date"
        />
      </UFormField>
    </div>

    <div class="flex justify-end gap-3 pt-4">
      <UButton
        variant="outline"
        color="neutral"
        @click="emit('cancelar')"
      >
        Cancelar
      </UButton>
      <UButton
        type="submit"
        icon="i-lucide-check"
      >
        {{ props.funcionario ? 'Atualizar' : 'Cadastrar' }}
      </UButton>
    </div>
  </form>
</template>
