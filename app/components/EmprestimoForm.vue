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

const TAXA_MENSAL = 0.015 // 1,5% ao mês

const valorParcela = computed(() => {
  const pv = form.valor_total
  const n = form.num_parcelas
  if (pv <= 0 || n <= 0) return 0
  const fator = Math.pow(1 + TAXA_MENSAL, n)
  return Math.round((pv * (TAXA_MENSAL * fator) / (fator - 1)) * 100) / 100
})

const valorTotalComJuros = computed(() => {
  return Math.round(valorParcela.value * form.num_parcelas * 100) / 100
})

const totalJuros = computed(() => {
  return Math.round((valorTotalComJuros.value - form.valor_total) * 100) / 100
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
        label="Valor Total (R$)"
        required
      >
        <AppInput
          v-model.number="form.valor_total"
          type="number"
          min="0.01"
          step="0.01"
          placeholder="0,00"
        />
      </AppFormField>

      <AppFormField
        label="Número de Parcelas"
        required
      >
        <AppInput
          v-model.number="form.num_parcelas"
          type="number"
          min="1"
          step="1"
          placeholder="1"
        />
      </AppFormField>
    </div>

    <!-- Prévia das parcelas -->
    <div
      v-if="valorParcela > 0"
      class="p-3 rounded-lg bg-primary/5 border border-primary/20"
    >
      <p class="text-sm font-medium text-primary">
        {{ form.num_parcelas }}x de {{ moeda(valorParcela) }}
      </p>
    </div>

    <!-- Alerta de juros -->
    <div
      v-if="valorParcela > 0 && form.valor_total > 0"
      class="p-3 rounded-lg border text-sm space-y-1"
      style="background-color: var(--status-warning-bg, #FFFBEB); border-color: var(--status-warning-border, #FCD34D); color: var(--status-warning-text, #92400E);"
    >
      <div class="flex items-center gap-2 font-medium">
        <AppIcon name="i-lucide-info" class="shrink-0" />
        <span>Juros de 1,5% ao mês (Tabela Price)</span>
      </div>
      <div class="pl-6 space-y-0.5 text-xs" style="opacity: 0.85;">
        <p>Valor emprestado: {{ moeda(form.valor_total) }}</p>
        <p>Total com juros: {{ moeda(valorTotalComJuros) }}</p>
        <p>Total de juros: {{ moeda(totalJuros) }}</p>
      </div>
    </div>

    <AppFormField
      label="Data de Início do Desconto"
      required
    >
      <AppInput
        v-model="form.data_inicio_desconto"
        type="date"
      />
    </AppFormField>

    <AppFormField
      label="Motivo / Justificativa"
      required
    >
      <AppTextarea
        v-model="form.motivo"
        placeholder="Descreva o motivo do empréstimo..."
        :rows="3"
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
        Cadastrar Empréstimo
      </AppButton>
    </div>
  </form>
</template>
