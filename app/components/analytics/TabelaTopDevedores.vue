<script setup lang="ts">
import type { TopDevedor } from '~/composables/useAnalytics'

defineProps<{
  data: TopDevedor[]
}>()

const { moeda } = useFormatters()
</script>

<template>
  <div class="card p-5">
    <h3 class="text-sm font-semibold mb-4 flex items-center gap-2">
      <AppIcon
        name="i-lucide-alert-circle"
        class="text-red-500"
      />
      Top Devedores
    </h3>
    <div
      v-if="data.length === 0"
      class="flex items-center justify-center py-8 text-sm"
      style="color: var(--text-muted);"
    >
      Nenhum devedor encontrado
    </div>
    <div
      v-else
      class="overflow-hidden"
    >
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-stone-200 dark:border-stone-800">
            <th
              class="text-left py-2 text-xs font-semibold uppercase"
              style="color: var(--text-secondary);"
            >
              #
            </th>
            <th
              class="text-left py-2 text-xs font-semibold uppercase"
              style="color: var(--text-secondary);"
            >
              Funcionário
            </th>
            <th
              class="text-left py-2 text-xs font-semibold uppercase hidden sm:table-cell"
              style="color: var(--text-secondary);"
            >
              Unidade
            </th>
            <th
              class="text-right py-2 text-xs font-semibold uppercase"
              style="color: var(--text-secondary);"
            >
              Saldo
            </th>
            <th
              class="text-right py-2 text-xs font-semibold uppercase hidden md:table-cell"
              style="color: var(--text-secondary);"
            >
              Atrasadas
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(item, i) in data"
            :key="i"
            class="border-b border-stone-100 dark:border-stone-800/50"
          >
            <td
              class="py-2.5 font-mono text-xs"
              style="color: var(--text-muted);"
            >
              {{ i + 1 }}
            </td>
            <td class="py-2.5 font-medium">
              {{ item.funcionario }}
            </td>
            <td
              class="py-2.5 hidden sm:table-cell"
              style="color: var(--text-secondary);"
            >
              {{ item.unidade }}
            </td>
            <td class="py-2.5 text-right font-bold text-red-600">
              {{ moeda(item.saldoDevedor) }}
            </td>
            <td class="py-2.5 text-right hidden md:table-cell">
              <AppBadge
                v-if="item.parcelasAtrasadas > 0"
                color="error"
                variant="subtle"
                size="xs"
              >
                {{ item.parcelasAtrasadas }} atrasada(s)
              </AppBadge>
              <span
                v-else
                class="text-xs"
                style="color: var(--text-muted);"
              >—</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
