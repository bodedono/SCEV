<script setup lang="ts">
const { isAdmin, isGestor } = useAuth()
const { moeda } = useFormatters()
const { stats, carregar: carregarStats } = useDashboard()

onMounted(() => {
  carregarStats()
})
</script>

<template>
  <div>
    <PageHeader
      titulo="Dashboard"
      descricao="Visão geral do sistema"
    />

    <!-- Cards de estatísticas -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
      <StatCard
        v-if="isAdmin"
        titulo="Pendências"
        :valor="stats.pendencias_aprovacao"
        icone="i-lucide-clock"
        cor="bg-yellow-100 text-yellow-600 dark:bg-yellow-900 dark:text-yellow-400"
        :destaque="stats.pendencias_aprovacao > 0"
      />

      <StatCard
        titulo="Empréstimos Ativos"
        :valor="stats.emprestimos_ativos"
        icone="i-lucide-banknote"
        cor="bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400"
      />

      <StatCard
        titulo="Vales Pendentes"
        :valor="stats.vales_pendentes"
        icone="i-lucide-receipt"
        cor="bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400"
      />

      <StatCard
        titulo="Total a Receber"
        :valor="moeda(stats.valor_total_receber)"
        icone="i-lucide-wallet"
      />

      <StatCard
        titulo="Parcelas Atrasadas"
        :valor="stats.parcelas_atrasadas"
        icone="i-lucide-alert-triangle"
        cor="bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400"
        :destaque="stats.parcelas_atrasadas > 0"
      />
    </div>

    <!-- Ações rápidas -->
    <div
      v-if="isAdmin || isGestor"
      class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6"
    >
      <NuxtLink
        to="/emprestimos/novo"
        class="flex items-center gap-4 p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-primary transition-colors"
      >
        <div class="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400">
          <UIcon
            name="i-lucide-plus"
            class="text-lg"
          />
        </div>
        <div>
          <p class="font-medium">Novo Empréstimo</p>
          <p class="text-sm text-gray-500">Cadastrar empréstimo para funcionário</p>
        </div>
      </NuxtLink>

      <NuxtLink
        to="/vales/novo"
        class="flex items-center gap-4 p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-primary transition-colors"
      >
        <div class="flex items-center justify-center w-10 h-10 rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-400">
          <UIcon
            name="i-lucide-plus"
            class="text-lg"
          />
        </div>
        <div>
          <p class="font-medium">Novo Vale</p>
          <p class="text-sm text-gray-500">Registrar vale para funcionário</p>
        </div>
      </NuxtLink>
    </div>

    <!-- Pendências (Admin) -->
    <div
      v-if="isAdmin && stats.pendencias_aprovacao > 0"
      class="mb-6"
    >
      <NuxtLink
        to="/aprovacoes"
        class="flex items-center gap-3 p-4 rounded-xl border-2 border-yellow-300 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950/20 hover:bg-yellow-100 dark:hover:bg-yellow-950/30 transition-colors"
      >
        <UIcon
          name="i-lucide-bell"
          class="text-yellow-600 text-xl"
        />
        <span class="font-medium text-yellow-700 dark:text-yellow-400">
          {{ stats.pendencias_aprovacao }} pendência(s) de aprovação aguardando
        </span>
        <UIcon
          name="i-lucide-arrow-right"
          class="text-yellow-600 ml-auto"
        />
      </NuxtLink>
    </div>
  </div>
</template>
