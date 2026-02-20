<script setup lang="ts">
import type { Funcionario, FormaDesconto } from '~/types'

const props = defineProps<{
  funcionarios: Funcionario[]
}>()

const emit = defineEmits<{
  salvar: [dados: {
    funcionario_id: number
    valor: number
    comentario: string
    referencia?: string
    data_ocorrido: string
    forma_desconto: FormaDesconto
    num_parcelas?: number
  }]
  cancelar: []
}>()

const form = reactive({
  funcionario_id: undefined as number | undefined,
  valor: 0,
  comentario: '',
  referencia: '',
  data_ocorrido: '',
  forma_desconto: 'INTEGRAL' as FormaDesconto,
  num_parcelas: 1
})

const funcionarioOptions = computed(() =>
  props.funcionarios.map(f => ({ label: `${f.nome} (${f.matricula})`, value: f.id }))
)

const formaDescontoOptions = [
  { label: 'Integral (desconto único)', value: 'INTEGRAL' },
  { label: 'Parcelas', value: 'PARCELAS' }
]

const salvar = () => {
  if (!form.funcionario_id || !form.comentario.trim()) return
  emit('salvar', {
    funcionario_id: form.funcionario_id,
    valor: form.valor,
    comentario: form.comentario,
    referencia: form.referencia || undefined,
    data_ocorrido: form.data_ocorrido,
    forma_desconto: form.forma_desconto,
    num_parcelas: form.forma_desconto === 'PARCELAS' ? form.num_parcelas : undefined
  })
}
</script>

<template>
  <form
    class="space-y-4"
    @submit.prevent="salvar"
  >
    <AppFormField
      label="Funcionário"
      required
    >
      <AppSelect
        v-model="form.funcionario_id"
        :items="funcionarioOptions"
        placeholder="Selecione o funcionário"
        searchable
      />
    </AppFormField>

    <div class="grid grid-cols-2 gap-4">
      <AppFormField
        label="Valor (R$)"
        required
      >
        <AppInput
          v-model.number="form.valor"
          type="number"
          min="0.01"
          step="0.01"
          placeholder="0,00"
        />
      </AppFormField>

      <AppFormField
        label="Data do Ocorrido"
        required
      >
        <AppInput
          v-model="form.data_ocorrido"
          type="date"
        />
      </AppFormField>
    </div>

    <AppFormField
      label="Comentário / Motivo"
      required
      hint="Obrigatório - descreva o que aconteceu"
    >
      <AppTextarea
        v-model="form.comentario"
        placeholder="Ex: Mesa 15 - cliente saiu sem pagar conta de R$ 87,50"
        :rows="3"
      />
    </AppFormField>

    <AppFormField
      label="Referência"
      hint="Opcional - nº comanda, mesa, etc."
    >
      <AppInput
        v-model="form.referencia"
        placeholder="Ex: Comanda 1234, Mesa 15"
      />
    </AppFormField>

    <AppFormField
      label="Forma de Desconto"
      required
    >
      <AppSelect
        v-model="form.forma_desconto"
        :items="formaDescontoOptions"
      />
    </AppFormField>

    <AppFormField
      v-if="form.forma_desconto === 'PARCELAS'"
      label="Número de Parcelas"
      required
    >
      <AppInput
        v-model.number="form.num_parcelas"
        type="number"
        min="1"
        step="1"
      />
    </AppFormField>

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
        Cadastrar Vale
      </AppButton>
    </div>
  </form>
</template>
