<script setup lang="ts">
import type { TopDevedor } from '~/composables/useAnalytics'

defineProps<{
  data: TopDevedor[]
}>()

const { moeda } = useFormatters()
</script>

<template>
  <div class="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
    <h3 class="text-sm font-semibold mb-4 flex items-center gap-2">
      <UIcon
        name="i-lucide-alert-circle"
        class="text-red-500"
      />
      Top Devedores
    </h3>
    <div
      v-if="data.length === 0"
      class="flex items-center justify-center py-8 text-gray-400 text-sm"
    >
      Nenhum devedor encontrado
    </div>
    <div
      v-else
      class="overflow-hidden"
    >
      <table class="w-full text-sm">
        <thead>
          <tr class="border-b border-gray-100 dark:border-gray-800">
            <th class="text-left py-2 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
              #
            </th>
            <th class="text-left py-2 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
              Funcionário
            </th>
            <th class="text-left py-2 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 hidden sm:table-cell">
              Unidade
            </th>
            <th class="text-right py-2 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
              Saldo
            </th>
            <th class="text-right py-2 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400 hidden md:table-cell">
              Atrasadas
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(item, i) in data"
            :key="i"
            class="border-b border-gray-50 dark:border-gray-800/50"
          >
            <td class="py-2.5 text-gray-400 font-mono text-xs">
              {{ i + 1 }}
            </td>
            <td class="py-2.5 font-medium">
              {{ item.funcionario }}
            </td>
            <td class="py-2.5 text-gray-500 hidden sm:table-cell">
              {{ item.unidade }}
            </td>
            <td class="py-2.5 text-right font-bold text-red-600">
              {{ moeda(item.saldoDevedor) }}
            </td>
            <td class="py-2.5 text-right hidden md:table-cell">
              <UBadge
                v-if="item.parcelasAtrasadas > 0"
                color="error"
                variant="subtle"
                size="xs"
              >
                {{ item.parcelasAtrasadas }} atrasada(s)
              </UBadge>
              <span
                v-else
                class="text-gray-400 text-xs"
              >—</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
