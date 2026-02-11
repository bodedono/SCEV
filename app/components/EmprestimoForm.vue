<script setup lang="ts">
import type { Funcionario } from '~/types'

const props = defineProps<{
  funcionarios: Funcionario[]
}>()

const emit = defineEmits<{
  salvar: [dados: {
    funcionario_id: number
    valor_total: number
    num_parcelas: number
    data_inicio_desconto: string
    motivo: string
  }]
  cancelar: []
}>()

const form = reactive({
  funcionario_id: undefined as number | undefined,
  valor_total: 0,
  num_parcelas: 1,
  data_inicio_desconto: '',
  motivo: ''
})

const { moeda } = useFormatters()

const valorParcela = computed(() => {
  if (form.valor_total > 0 && form.num_parcelas > 0) {
    return form.valor_total / form.num_parcelas
  }
  return 0
})

const funcionarioOptions = computed(() =>
  props.funcionarios.map(f => ({ label: `${f.nome} (${f.matricula})`, value: f.id }))
)

const salvar = () => {
  if (!form.funcionario_id) return
  emit('salvar', {
    funcionario_id: form.funcionario_id,
    valor_total: form.valor_total,
    num_parcelas: form.num_parcelas,
    data_inicio_desconto: form.data_inicio_desconto,
    motivo: form.motivo
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
      <UFormField label="Valor Total (R$)" required>
        <UInput v-model.number="form.valor_total" type="number" min="0.01" step="0.01" placeholder="0,00" />
      </UFormField>

      <UFormField label="Número de Parcelas" required>
        <UInput v-model.number="form.num_parcelas" type="number" min="1" step="1" placeholder="1" />
      </UFormField>
    </div>

    <!-- Prévia das parcelas -->
    <div v-if="valorParcela > 0" class="p-3 rounded-lg bg-primary/5 border border-primary/20">
      <p class="text-sm font-medium text-primary">
        {{ form.num_parcelas }}x de {{ moeda(valorParcela) }}
      </p>
    </div>

    <UFormField label="Data de Início do Desconto" required>
      <UInput v-model="form.data_inicio_desconto" type="date" />
    </UFormField>

    <UFormField label="Motivo / Justificativa" required>
      <UTextarea v-model="form.motivo" placeholder="Descreva o motivo do empréstimo..." :rows="3" />
    </UFormField>

    <div class="flex justify-end gap-2 pt-4">
      <UButton variant="ghost" color="neutral" @click="emit('cancelar')">
        Cancelar
      </UButton>
      <UButton type="submit">
        Cadastrar Empréstimo
      </UButton>
    </div>
  </form>
</template>
