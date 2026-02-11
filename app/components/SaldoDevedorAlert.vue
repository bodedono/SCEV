<script setup lang="ts">
defineProps<{
  nome: string
  saldo: number
}>()

const { moeda } = useFormatters()
</script>

<template>
  <div v-if="saldo > 0" class="rounded-lg border-2 border-red-300 bg-red-50 dark:bg-red-950/20 dark:border-red-800 p-4">
    <div class="flex items-center gap-3">
      <UIcon name="i-lucide-alert-triangle" class="text-red-600 text-xl shrink-0" />
      <div>
        <p class="font-semibold text-red-700 dark:text-red-400">Atenção: Saldo Devedor Pendente</p>
        <p class="text-sm text-red-600 dark:text-red-400 mt-1">
          <strong>{{ nome }}</strong> possui saldo devedor de <strong>{{ moeda(saldo) }}</strong>
        </p>
      </div>
    </div>
  </div>
</template>
