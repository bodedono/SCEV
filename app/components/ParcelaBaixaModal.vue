<script setup lang="ts">
import type { Parcela } from '~/types'

const props = defineProps<{
  parcela: Parcela | null
}>()

const model = defineModel<boolean>({ default: false })

const emit = defineEmits<{
  confirmar: [parcelaId: number, comprovante: File, observacoes?: string]
}>()

const { moeda, data } = useFormatters()
const { analisarComprovante } = useParcelas()

const comprovante = ref<File | null>(null)
const observacoes = ref('')
const enviando = ref(false)
const analisando = ref(false)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const analiseIA = ref<any>(null)

const handleFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement
  if (!target.files?.length || !props.parcela) return

  comprovante.value = target.files[0] ?? null
  analiseIA.value = null

  // Analisar com IA automaticamente
  if (!comprovante.value) return
  analisando.value = true
  try {
    analiseIA.value = await analisarComprovante(props.parcela.id, comprovante.value!)
  } catch (e) {
    console.error('Erro na análise IA:', e)
    analiseIA.value = null
  } finally {
    analisando.value = false
  }
}

const confirmar = async () => {
  if (!props.parcela || !comprovante.value) return
  enviando.value = true
  try {
    emit('confirmar', props.parcela.id, comprovante.value, observacoes.value || undefined)
    model.value = false
    resetar()
  } finally {
    enviando.value = false
  }
}

const resetar = () => {
  comprovante.value = null
  observacoes.value = ''
  analiseIA.value = null
}

watch(model, (open) => {
  if (!open) resetar()
})
</script>

<template>
  <AppModal
    v-model:open="model"
    title="Registrar Baixa"
    icon="i-lucide-receipt"
  >
    <div
      v-if="parcela"
      class="space-y-4"
    >
      <!-- Info da parcela -->
      <div
        class="p-4 rounded-lg space-y-2"
        style="background-color: var(--bg-surface-hover);"
      >
        <div class="flex justify-between text-sm">
          <span class="text-body">Funcionário</span>
          <span class="font-medium">{{ parcela.funcionario?.nome ?? '-' }}</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-body">Parcela</span>
          <span class="font-medium">{{ parcela.numero }}/{{ parcela.total_parcelas }}</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-body">Tipo</span>
          <span class="font-medium">{{ parcela.tipo === 'EMPRESTIMO' ? 'Empréstimo' : 'Vale' }}</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-body">Valor</span>
          <span class="font-bold text-primary">{{ moeda(parcela.valor) }}</span>
        </div>
        <div class="flex justify-between text-sm">
          <span class="text-body">Vencimento</span>
          <span class="font-medium">{{ data(parcela.data_prevista) }}</span>
        </div>
      </div>

      <!-- Upload comprovante -->
      <AppFormField
        label="Comprovante"
        required
        hint="PDF, JPG ou PNG (máx. 5MB)"
      >
        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          class="block w-full text-sm text-body file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
          @change="handleFileChange"
        >
      </AppFormField>

      <!-- Analisando -->
      <div
        v-if="analisando"
        class="flex items-center gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400"
      >
        <AppIcon
          name="i-lucide-brain"
          class="animate-pulse text-lg"
        />
        <span class="text-sm">IA analisando comprovante...</span>
      </div>

      <!-- Resultado da análise IA -->
      <div
        v-if="analiseIA && !analisando"
        class="space-y-2"
      >
        <!-- Sem alertas = tudo ok -->
        <div
          v-if="analiseIA.aprovado_automaticamente"
          class="p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800"
        >
          <div class="flex items-center gap-2 text-green-700 dark:text-green-400">
            <AppIcon
              name="i-lucide-check-circle"
              class="text-lg"
            />
            <span class="text-sm font-medium">Comprovante validado pela IA</span>
          </div>
          <div class="mt-2 text-xs text-green-600 dark:text-green-500 space-y-1">
            <p v-if="analiseIA.analise?.valor">
              Valor encontrado: R$ {{ Number(analiseIA.analise.valor).toFixed(2) }}
            </p>
            <p v-if="analiseIA.analise?.tipo_documento">
              Tipo: {{ analiseIA.analise.tipo_documento }}
            </p>
          </div>
        </div>

        <!-- Com alertas -->
        <div
          v-else
          class="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800"
        >
          <div class="flex items-center gap-2 text-yellow-700 dark:text-yellow-400 mb-2">
            <AppIcon
              name="i-lucide-alert-triangle"
              class="text-lg"
            />
            <span class="text-sm font-medium">Atenção - verificar manualmente</span>
          </div>
          <ul class="text-xs text-yellow-600 dark:text-yellow-500 space-y-1">
            <li
              v-for="(alerta, i) in analiseIA.alertas"
              :key="i"
              class="flex items-start gap-1"
            >
              <span class="shrink-0 mt-0.5">-</span>
              <span>{{ alerta }}</span>
            </li>
          </ul>
          <div class="mt-2 text-xs text-yellow-500 dark:text-yellow-600">
            <p v-if="analiseIA.analise?.valor">
              Valor no comprovante: R$ {{ Number(analiseIA.analise.valor).toFixed(2) }}
            </p>
            <p v-if="analiseIA.analise?.tipo_documento">
              Tipo: {{ analiseIA.analise.tipo_documento }}
            </p>
          </div>
        </div>
      </div>

      <div
        v-if="comprovante && !analisando && !analiseIA"
        class="text-sm text-green-600 flex items-center gap-2"
      >
        <AppIcon name="i-lucide-check-circle" />
        {{ comprovante.name }}
      </div>

      <!-- Observações -->
      <AppFormField
        label="Observações"
        hint="Opcional"
      >
        <AppTextarea
          v-model="observacoes"
          placeholder="Observações adicionais..."
          :rows="2"
        />
      </AppFormField>
    </div>
    <template #footer>
      <div class="flex justify-end gap-2">
        <AppButton
          variant="ghost"
          color="neutral"
          @click="model = false"
        >
          Cancelar
        </AppButton>
        <AppButton
          :disabled="!comprovante || analisando"
          :loading="enviando"
          @click="confirmar"
        >
          Confirmar Baixa
        </AppButton>
      </div>
    </template>
  </AppModal>
</template>
