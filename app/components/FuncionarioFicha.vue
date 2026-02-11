<script setup lang="ts">
import type { Funcionario, Emprestimo, Vale } from '~/types'

defineProps<{
  funcionario: Funcionario
  emprestimos: Emprestimo[]
  vales: Vale[]
}>()

const { moeda, data } = useFormatters()
</script>

<template>
  <div class="space-y-6">
    <!-- Dados pessoais -->
    <div class="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
      <div class="flex items-center gap-4 mb-4">
        <UAvatar :label="funcionario.nome.charAt(0)" size="lg" />
        <div>
          <h2 class="text-xl font-bold text-gray-900 dark:text-white">{{ funcionario.nome }}</h2>
          <p class="text-sm text-gray-500">{{ funcionario.cargo }} &middot; {{ funcionario.unidade?.nome }}</p>
        </div>
        <div class="ml-auto">
          <UBadge :color="funcionario.ativo ? 'success' : 'error'" variant="subtle">
            {{ funcionario.ativo ? 'Ativo' : 'Inativo' }}
          </UBadge>
        </div>
      </div>

      <div class="grid grid-cols-3 gap-4">
        <div>
          <p class="text-xs text-gray-500 uppercase tracking-wide">Matrícula</p>
          <p class="font-medium">{{ funcionario.matricula }}</p>
        </div>
        <div>
          <p class="text-xs text-gray-500 uppercase tracking-wide">Admissão</p>
          <p class="font-medium">{{ data(funcionario.data_admissao) }}</p>
        </div>
        <div>
          <p class="text-xs text-gray-500 uppercase tracking-wide">Saldo Devedor</p>
          <p class="font-bold text-lg" :class="(funcionario.saldo_devedor ?? 0) > 0 ? 'text-red-600' : 'text-green-600'">
            {{ moeda(funcionario.saldo_devedor ?? 0) }}
          </p>
        </div>
      </div>
    </div>

    <!-- Empréstimos -->
    <div class="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
      <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
        <UIcon name="i-lucide-banknote" class="text-blue-500" />
        Empréstimos
      </h3>

      <div v-if="emprestimos.length === 0" class="text-sm text-gray-500 text-center py-4">
        Nenhum empréstimo registrado
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="emp in emprestimos"
          :key="emp.id"
          class="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
        >
          <div>
            <p class="font-medium">{{ moeda(emp.valor_total) }}</p>
            <p class="text-sm text-gray-500">
              {{ emp.num_parcelas }}x de {{ moeda(emp.valor_parcela) }} &middot; {{ data(emp.data_solicitacao) }}
            </p>
          </div>
          <StatusBadge :status="emp.status" />
        </div>
      </div>
    </div>

    <!-- Vales -->
    <div class="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
      <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
        <UIcon name="i-lucide-receipt" class="text-orange-500" />
        Vales
      </h3>

      <div v-if="vales.length === 0" class="text-sm text-gray-500 text-center py-4">
        Nenhum vale registrado
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="vale in vales"
          :key="vale.id"
          class="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
        >
          <div>
            <p class="font-medium">{{ moeda(vale.valor) }}</p>
            <p class="text-sm text-gray-500 truncate max-w-md">{{ vale.comentario }}</p>
            <p class="text-xs text-gray-400">{{ data(vale.data_ocorrido) }}</p>
          </div>
          <StatusBadge :status="vale.status" />
        </div>
      </div>
    </div>
  </div>
</template>
