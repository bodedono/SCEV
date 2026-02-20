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
    <div class="card p-6">
      <div class="flex items-center gap-4 mb-4">
        <AppAvatar
          :label="funcionario.nome.charAt(0)"
          size="lg"
        />
        <div>
          <h2 class="text-xl font-bold text-heading">
            {{ funcionario.nome }}
          </h2>
          <p class="text-sm text-body">
            {{ funcionario.cargo }} &middot; {{ funcionario.unidade?.nome }}
          </p>
        </div>
        <div class="ml-auto">
          <AppBadge
            :color="funcionario.ativo ? 'success' : 'error'"
            variant="subtle"
          >
            {{ funcionario.ativo ? 'Ativo' : 'Inativo' }}
          </AppBadge>
        </div>
      </div>

      <div class="grid grid-cols-3 gap-4">
        <div>
          <p class="text-xs text-body uppercase tracking-wide">
            Matrícula
          </p>
          <p class="font-medium">
            {{ funcionario.matricula }}
          </p>
        </div>
        <div>
          <p class="text-xs text-body uppercase tracking-wide">
            Admissão
          </p>
          <p class="font-medium">
            {{ data(funcionario.data_admissao) }}
          </p>
        </div>
        <div>
          <p class="text-xs text-body uppercase tracking-wide">
            Saldo Devedor
          </p>
          <p
            class="font-bold text-lg"
            :class="(funcionario.saldo_devedor ?? 0) > 0 ? 'text-red-600' : 'text-green-600'"
          >
            {{ moeda(funcionario.saldo_devedor ?? 0) }}
          </p>
        </div>
      </div>
    </div>

    <!-- Empréstimos -->
    <div class="card p-6">
      <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
        <AppIcon
          name="i-lucide-banknote"
          class="text-amber-600"
        />
        Empréstimos
      </h3>

      <div
        v-if="emprestimos.length === 0"
        class="text-sm text-body text-center py-4"
      >
        Nenhum empréstimo registrado
      </div>

      <div
        v-else
        class="space-y-3"
      >
        <div
          v-for="emp in emprestimos"
          :key="emp.id"
          class="flex items-center justify-between p-3 rounded-lg bg-surface-area"
        >
          <div>
            <p class="font-medium">
              {{ moeda(emp.valor_total) }}
            </p>
            <p class="text-sm text-body">
              {{ emp.num_parcelas }}x de {{ moeda(emp.valor_parcela) }} &middot; {{ data(emp.data_solicitacao) }}
            </p>
          </div>
          <StatusBadge :status="emp.status" />
        </div>
      </div>
    </div>

    <!-- Vales -->
    <div class="card p-6">
      <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
        <AppIcon
          name="i-lucide-receipt"
          class="text-amber-600"
        />
        Vales
      </h3>

      <div
        v-if="vales.length === 0"
        class="text-sm text-body text-center py-4"
      >
        Nenhum vale registrado
      </div>

      <div
        v-else
        class="space-y-3"
      >
        <div
          v-for="vale in vales"
          :key="vale.id"
          class="flex items-center justify-between p-3 rounded-lg bg-surface-area"
        >
          <div>
            <p class="font-medium">
              {{ moeda(vale.valor) }}
            </p>
            <p class="text-sm text-body truncate max-w-md">
              {{ vale.comentario }}
            </p>
            <p class="text-xs text-caption">
              {{ data(vale.data_ocorrido) }}
            </p>
          </div>
          <StatusBadge :status="vale.status" />
        </div>
      </div>
    </div>
  </div>
</template>
