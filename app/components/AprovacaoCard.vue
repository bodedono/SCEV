<script setup lang="ts">
import type { Aprovacao } from '~/types'

defineProps<{
  item: Aprovacao
}>()

const emit = defineEmits<{
  aprovar: [id: number, tipo: string]
  rejeitar: [id: number, tipo: string]
}>()

const { moeda, data } = useFormatters()
</script>

<template>
  <div class="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4">
    <div class="flex items-start gap-4">
      <!-- Ícone -->
      <div
        class="flex items-center justify-center w-10 h-10 rounded-lg shrink-0"
        :class="item.tipo === 'EMPRESTIMO' ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400' : 'bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400'"
      >
        <UIcon
          :name="item.tipo === 'EMPRESTIMO' ? 'i-lucide-banknote' : 'i-lucide-receipt'"
          class="text-lg"
        />
      </div>

      <!-- Info -->
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2">
          <UBadge
            :color="item.tipo === 'EMPRESTIMO' ? 'info' : 'warning'"
            variant="subtle"
            size="xs"
          >
            {{ item.tipo === 'EMPRESTIMO' ? 'Empréstimo' : 'Vale' }}
          </UBadge>
        </div>
        <p class="mt-1 font-medium text-gray-900 dark:text-white">
          {{ item.funcionario.nome }}
        </p>
        <p class="text-sm text-gray-500">
          {{ item.funcionario.unidade?.nome }} &middot; {{ data(item.data) }}
        </p>
        <p class="mt-1 text-lg font-bold text-primary">
          {{ moeda(item.valor) }}
        </p>
        <p class="text-xs text-gray-400 mt-1">
          Solicitado por: {{ item.solicitante.nome }}
        </p>
      </div>

      <!-- Ações -->
      <div class="flex gap-2 shrink-0">
        <UButton
          icon="i-lucide-x"
          color="error"
          variant="soft"
          size="sm"
          @click="emit('rejeitar', item.id, item.tipo)"
        />
        <UButton
          icon="i-lucide-check"
          color="success"
          variant="soft"
          size="sm"
          @click="emit('aprovar', item.id, item.tipo)"
        />
      </div>
    </div>
  </div>
</template>
