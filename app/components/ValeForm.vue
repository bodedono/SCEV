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
  <form class="space-y-4" @submit.prevent="salvar">
    <UFormField label="Funcionário" required>
      <USelect
        v-model="form.funcionario_id"
        :items="funcionarioOptions"
        placeholder="Selecione o funcionário"
        searchable
      />
    </UFormField>

    <div class="grid grid-cols-2 gap-4">
      <UFormField label="Valor (R$)" required>
        <UInput v-model.number="form.valor" type="number" min="0.01" step="0.01" placeholder="0,00" />
      </UFormField>

      <UFormField label="Data do Ocorrido" required>
        <UInput v-model="form.data_ocorrido" type="date" />
      </UFormField>
    </div>

    <UFormField label="Comentário / Motivo" required hint="Obrigatório - descreva o que aconteceu">
      <UTextarea
        v-model="form.comentario"
        placeholder="Ex: Mesa 15 - cliente saiu sem pagar conta de R$ 87,50"
        :rows="3"
      />
    </UFormField>

    <UFormField label="Referência" hint="Opcional - nº comanda, mesa, etc.">
      <UInput v-model="form.referencia" placeholder="Ex: Comanda 1234, Mesa 15" />
    </UFormField>

    <UFormField label="Forma de Desconto" required>
      <USelect v-model="form.forma_desconto" :items="formaDescontoOptions" />
    </UFormField>

    <UFormField v-if="form.forma_desconto === 'PARCELAS'" label="Número de Parcelas" required>
      <UInput v-model.number="form.num_parcelas" type="number" min="1" step="1" />
    </UFormField>

    <div class="flex justify-end gap-2 pt-4">
      <UButton variant="ghost" color="neutral" @click="emit('cancelar')">
        Cancelar
      </UButton>
      <UButton type="submit">
        Cadastrar Vale
      </UButton>
    </div>
  </form>
</template>
