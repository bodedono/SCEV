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
  <div class="card p-4">
    <div class="flex items-start gap-4">
      <!-- Ícone -->
      <div
        class="flex items-center justify-center w-10 h-10 rounded-lg shrink-0"
        :class="item.tipo === 'EMPRESTIMO' ? 'icon-box-emprestimo' : 'icon-box-vale'"
      >
        <AppIcon
          :name="item.tipo === 'EMPRESTIMO' ? 'i-lucide-banknote' : 'i-lucide-receipt'"
          class="text-lg"
        />
      </div>

      <!-- Info -->
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2">
          <AppBadge
            :color="item.tipo === 'EMPRESTIMO' ? 'info' : 'warning'"
            variant="subtle"
            size="xs"
          >
            {{ item.tipo === 'EMPRESTIMO' ? 'Empréstimo' : 'Vale' }}
          </AppBadge>
        </div>
        <p class="mt-1 font-medium text-stone-800 dark:text-stone-50">
          {{ item.funcionario.nome }}
        </p>
        <p
          class="text-sm"
          style="color: var(--text-secondary);"
        >
          {{ item.funcionario.unidade?.nome }} &middot; {{ data(item.data) }}
        </p>
        <p class="mt-1 text-lg font-bold text-primary">
          {{ moeda(item.valor) }}
        </p>
        <p
          class="text-xs mt-1"
          style="color: var(--text-muted);"
        >
          Solicitado por: {{ item.solicitante.nome }}
        </p>
      </div>

      <!-- Ações -->
      <div class="flex gap-2 shrink-0">
        <AppButton
          icon="i-lucide-x"
          color="error"
          variant="soft"
          size="sm"
          @click="emit('rejeitar', item.id, item.tipo)"
        />
        <AppButton
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
