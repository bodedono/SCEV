<script setup lang="ts">
const { isAdmin, isGestor, unidadeId } = useAuth()
const { moeda } = useFormatters()
const { stats, carregar: carregarStats } = useDashboard()
const { funcionarios, listar: listarFuncionarios } = useFuncionarios()
const { criar: criarEmprestimo } = useEmprestimos()
const { criar: criarVale } = useVales()
const { comFeedback } = useToastFeedback()

const modalEmprestimo = ref(false)
const modalVale = ref(false)

const abrirModalEmprestimo = () => {
  if (funcionarios.value.length === 0) {
    listarFuncionarios(isGestor.value ? unidadeId.value ?? undefined : undefined)
  }
  modalEmprestimo.value = true
}

const abrirModalVale = () => {
  if (funcionarios.value.length === 0) {
    listarFuncionarios(isGestor.value ? unidadeId.value ?? undefined : undefined)
  }
  modalVale.value = true
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleSalvarEmprestimo = async (dados: any) => {
  const result = await comFeedback(
    () => criarEmprestimo(dados),
    'Empréstimo cadastrado com sucesso',
    'Erro ao cadastrar empréstimo'
  )
  if (result !== null) {
    modalEmprestimo.value = false
    carregarStats()
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleSalvarVale = async (dados: any) => {
  const result = await comFeedback(
    () => criarVale(dados),
    'Vale cadastrado com sucesso',
    'Erro ao cadastrar vale'
  )
  if (result !== null) {
    modalVale.value = false
    carregarStats()
  }
}

const atalhos = [
  { label: 'Funcionários', icon: 'i-lucide-users', to: '/funcionarios', cor: 'icon-box-info' },
  { label: 'Empréstimos', icon: 'i-lucide-banknote', to: '/emprestimos', cor: 'icon-box-emprestimo' },
  { label: 'Vales', icon: 'i-lucide-receipt', to: '/vales', cor: 'icon-box-vale' },
  { label: 'Parcelas', icon: 'i-lucide-calendar-check', to: '/parcelas', cor: 'icon-box-recebimento' },
  { label: 'Analytics', icon: 'i-lucide-bar-chart-3', to: '/analytics', cor: 'icon-box-adimplencia' }
]

onMounted(() => {
  carregarStats()
})
</script>

<template>
  <div>
    <!-- Header -->
    <PageHeader
      titulo="Dashboard"
      descricao="Visão geral do sistema"
    >
      <template #acoes>
        <AppButton
          v-if="isAdmin || isGestor"
          icon="i-lucide-plus"
          @click="abrirModalEmprestimo"
        >
          Novo Empréstimo
        </AppButton>
        <AppButton
          v-if="isAdmin || isGestor"
          icon="i-lucide-plus"
          variant="outline"
          color="neutral"
          @click="abrirModalVale"
        >
          Novo Vale
        </AppButton>
      </template>
    </PageHeader>

    <!-- Stat Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard
        titulo="Empréstimos Ativos"
        :valor="stats.emprestimos_ativos"
        icone="i-lucide-banknote"
        cor="icon-box-emprestimo"
        subtitulo="No período atual"
      />
      <StatCard
        titulo="Vales Pendentes"
        :valor="stats.vales_pendentes"
        icone="i-lucide-receipt"
        cor="icon-box-vale"
        subtitulo="Aguardando processamento"
      />
      <StatCard
        titulo="Total a Receber"
        :valor="moeda(stats.valor_total_receber)"
        icone="i-lucide-wallet"
        cor="icon-box-recebimento"
        subtitulo="Valor total acumulado"
      />
      <StatCard
        titulo="Parcelas Atrasadas"
        :valor="stats.parcelas_atrasadas"
        icone="i-lucide-alert-triangle"
        cor="icon-box-alerta"
        :destaque="stats.parcelas_atrasadas > 0"
        subtitulo="Requer atenção"
      />
    </div>

    <!-- Row 2: 3 columns -->
    <div class="grid grid-cols-1 lg:grid-cols-7 gap-4 mb-6">
      <!-- Ações Rápidas -->
      <div class="lg:col-span-3 dash-section">
        <div class="dash-section-header">
          <h3 class="dash-section-title">
            Ações Rápidas
          </h3>
        </div>
        <div class="space-y-1">
          <button
            v-if="isAdmin || isGestor"
            class="dash-action-item"
            @click="abrirModalEmprestimo"
          >
            <div class="flex items-center justify-center w-10 h-10 rounded-lg icon-box-emprestimo">
              <AppIcon
                name="i-lucide-banknote"
                class="text-lg"
              />
            </div>
            <div>
              <p
                class="font-medium text-sm"
                style="color: var(--text-main);"
              >
                Novo Empréstimo
              </p>
              <p
                class="text-xs"
                style="color: var(--text-muted);"
              >
                Cadastrar empréstimo para funcionário
              </p>
            </div>
          </button>
          <button
            v-if="isAdmin || isGestor"
            class="dash-action-item"
            @click="abrirModalVale"
          >
            <div class="flex items-center justify-center w-10 h-10 rounded-lg icon-box-vale">
              <AppIcon
                name="i-lucide-receipt"
                class="text-lg"
              />
            </div>
            <div>
              <p
                class="font-medium text-sm"
                style="color: var(--text-main);"
              >
                Novo Vale
              </p>
              <p
                class="text-xs"
                style="color: var(--text-muted);"
              >
                Registrar vale para funcionário
              </p>
            </div>
          </button>
          <NuxtLink
            to="/funcionarios"
            class="dash-action-item"
          >
            <div class="flex items-center justify-center w-10 h-10 rounded-lg icon-box-info">
              <AppIcon
                name="i-lucide-user-plus"
                class="text-lg"
              />
            </div>
            <div>
              <p
                class="font-medium text-sm"
                style="color: var(--text-main);"
              >
                Gerenciar Funcionários
              </p>
              <p
                class="text-xs"
                style="color: var(--text-muted);"
              >
                Cadastrar e editar funcionários
              </p>
            </div>
          </NuxtLink>
        </div>
      </div>

      <!-- Pendências / Lembretes -->
      <div class="lg:col-span-2 dash-section">
        <div class="dash-section-header">
          <h3 class="dash-section-title">
            Pendências
          </h3>
        </div>
        <div
          v-if="isAdmin && stats.pendencias_aprovacao > 0"
          class="space-y-4"
        >
          <div class="p-4 rounded-xl alert-warning-box">
            <div class="flex items-center gap-3 mb-3">
              <AppIcon
                name="i-lucide-bell"
                class="text-xl"
                style="color: var(--clr-accent);"
              />
              <span
                class="font-semibold text-sm"
                style="color: var(--clr-accent);"
              >
                Aprovações Pendentes
              </span>
            </div>
            <p
              class="text-sm mb-3"
              style="color: var(--text-secondary);"
            >
              {{ stats.pendencias_aprovacao }} item(ns) aguardando sua aprovação
            </p>
            <NuxtLink to="/aprovacoes">
              <AppButton
                icon="i-lucide-check-circle"
                size="sm"
              >
                Revisar Agora
              </AppButton>
            </NuxtLink>
          </div>
        </div>
        <div
          v-else
          class="flex flex-col items-center justify-center py-8 text-center"
        >
          <div
            class="w-12 h-12 rounded-xl flex items-center justify-center mb-3"
            style="background-color: var(--bg-surface-hover);"
          >
            <AppIcon
              name="i-lucide-check-circle"
              class="text-2xl"
              style="color: var(--text-muted);"
            />
          </div>
          <p
            class="text-sm font-medium"
            style="color: var(--text-main);"
          >
            Tudo em dia!
          </p>
          <p
            class="text-xs mt-1"
            style="color: var(--text-muted);"
          >
            Nenhuma pendência no momento
          </p>
        </div>
      </div>

      <!-- Acesso Rápido -->
      <div class="lg:col-span-2 dash-section">
        <div class="dash-section-header">
          <h3 class="dash-section-title">
            Navegação
          </h3>
        </div>
        <div class="space-y-1">
          <NuxtLink
            v-for="item in atalhos"
            :key="item.to"
            :to="item.to"
            class="dash-nav-item"
          >
            <div
              class="flex items-center justify-center w-8 h-8 rounded-lg"
              :class="item.cor"
            >
              <AppIcon
                :name="item.icon"
                class="text-base"
              />
            </div>
            <span>{{ item.label }}</span>
            <AppIcon
              name="i-lucide-chevron-right"
              class="ml-auto text-sm"
              style="color: var(--text-muted);"
            />
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Row 3: 3 columns -->
    <div class="grid grid-cols-1 lg:grid-cols-7 gap-4">
      <!-- Resumo Financeiro -->
      <div class="lg:col-span-3 dash-section">
        <div class="dash-section-header">
          <h3 class="dash-section-title">
            Resumo Financeiro
          </h3>
        </div>
        <div class="space-y-4">
          <div class="flex items-center justify-between p-3 rounded-lg" style="background-color: var(--bg-surface-hover);">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg icon-box-emprestimo flex items-center justify-center">
                <AppIcon
                  name="i-lucide-banknote"
                  class="text-base"
                />
              </div>
              <div>
                <p
                  class="text-sm font-medium"
                  style="color: var(--text-main);"
                >
                  Empréstimos Ativos
                </p>
                <p
                  class="text-xs"
                  style="color: var(--text-muted);"
                >
                  Em andamento
                </p>
              </div>
            </div>
            <span
              class="text-lg font-bold"
              style="color: var(--text-main);"
            >
              {{ stats.emprestimos_ativos }}
            </span>
          </div>
          <div class="flex items-center justify-between p-3 rounded-lg" style="background-color: var(--bg-surface-hover);">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg icon-box-vale flex items-center justify-center">
                <AppIcon
                  name="i-lucide-receipt"
                  class="text-base"
                />
              </div>
              <div>
                <p
                  class="text-sm font-medium"
                  style="color: var(--text-main);"
                >
                  Vales Pendentes
                </p>
                <p
                  class="text-xs"
                  style="color: var(--text-muted);"
                >
                  Aguardando
                </p>
              </div>
            </div>
            <span
              class="text-lg font-bold"
              style="color: var(--text-main);"
            >
              {{ stats.vales_pendentes }}
            </span>
          </div>
          <div class="flex items-center justify-between p-3 rounded-lg" style="background-color: var(--bg-surface-hover);">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg icon-box-alerta flex items-center justify-center">
                <AppIcon
                  name="i-lucide-alert-triangle"
                  class="text-base"
                />
              </div>
              <div>
                <p
                  class="text-sm font-medium"
                  style="color: var(--text-main);"
                >
                  Parcelas Atrasadas
                </p>
                <p
                  class="text-xs"
                  style="color: var(--text-muted);"
                >
                  Requer ação
                </p>
              </div>
            </div>
            <span
              class="text-lg font-bold"
              :style="stats.parcelas_atrasadas > 0 ? 'color: var(--clr-perigo);' : 'color: var(--text-main);'"
            >
              {{ stats.parcelas_atrasadas }}
            </span>
          </div>
        </div>
      </div>

      <!-- Status Geral -->
      <div class="lg:col-span-2 dash-section">
        <div class="dash-section-header">
          <h3 class="dash-section-title">
            Status Geral
          </h3>
        </div>
        <div class="flex flex-col items-center justify-center py-4">
          <div
            class="relative w-32 h-32 mb-4"
          >
            <svg
              viewBox="0 0 120 120"
              class="w-full h-full -rotate-90"
            >
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke="var(--bg-surface-hover)"
                stroke-width="10"
              />
              <circle
                cx="60"
                cy="60"
                r="50"
                fill="none"
                stroke="var(--clr-primary)"
                stroke-width="10"
                stroke-linecap="round"
                :stroke-dasharray="`${stats.emprestimos_ativos > 0 ? Math.min(((stats.emprestimos_ativos - stats.parcelas_atrasadas) / Math.max(stats.emprestimos_ativos, 1)) * 314, 314) : 250} 314`"
              />
            </svg>
            <div class="absolute inset-0 flex flex-col items-center justify-center">
              <span
                class="text-2xl font-bold"
                style="color: var(--text-main);"
              >
                {{ stats.emprestimos_ativos > 0 ? Math.round(((stats.emprestimos_ativos - stats.parcelas_atrasadas) / stats.emprestimos_ativos) * 100) : 100 }}%
              </span>
              <span
                class="text-xs"
                style="color: var(--text-muted);"
              >
                Em dia
              </span>
            </div>
          </div>
          <div class="flex items-center gap-4 text-xs">
            <div class="flex items-center gap-1.5">
              <div
                class="w-2.5 h-2.5 rounded-full"
                style="background-color: var(--clr-primary);"
              />
              <span style="color: var(--text-muted);">Em dia</span>
            </div>
            <div class="flex items-center gap-1.5">
              <div
                class="w-2.5 h-2.5 rounded-full"
                style="background-color: var(--bg-surface-hover);"
              />
              <span style="color: var(--text-muted);">Atrasadas</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Informações do Sistema -->
      <div class="lg:col-span-2 dash-section">
        <div class="dash-section-header">
          <h3 class="dash-section-title">
            Sistema
          </h3>
        </div>
        <div class="space-y-4">
          <div class="text-center py-4">
            <div
              class="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-3"
              style="background-color: var(--clr-primary); color: var(--clr-primary-fg);"
            >
              <AppIcon
                name="i-lucide-building-2"
                class="text-2xl"
              />
            </div>
            <p
              class="font-semibold"
              style="color: var(--text-main);"
            >
              SCEV
            </p>
            <p
              class="text-xs mt-1"
              style="color: var(--text-muted);"
            >
              Grupo Do Nô
            </p>
          </div>
          <div class="space-y-2">
            <div class="flex items-center justify-between text-xs px-1">
              <span style="color: var(--text-muted);">Valor a Receber</span>
              <span
                class="font-semibold"
                style="color: var(--text-main);"
              >
                {{ moeda(stats.valor_total_receber) }}
              </span>
            </div>
            <div class="flex items-center justify-between text-xs px-1">
              <span style="color: var(--text-muted);">Pendências</span>
              <span
                class="font-semibold"
                style="color: var(--text-main);"
              >
                {{ stats.pendencias_aprovacao }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Novo Empréstimo -->
    <AppModal
      v-model:open="modalEmprestimo"
      title="Novo Empréstimo"
      icon="i-lucide-banknote"
      size="lg"
    >
      <InfoAlert
        v-if="isGestor"
        message="Este empréstimo precisará ser aprovado pelo Admin antes de gerar as parcelas."
        color="yellow"
        class="mb-4"
      />
      <EmprestimoForm
        :funcionarios="funcionarios"
        @salvar="handleSalvarEmprestimo"
        @cancelar="modalEmprestimo = false"
      />
    </AppModal>

    <!-- Modal Novo Vale -->
    <AppModal
      v-model:open="modalVale"
      title="Novo Vale"
      icon="i-lucide-receipt"
      size="lg"
    >
      <InfoAlert
        v-if="isGestor"
        message="Este vale precisará ser aprovado pelo Admin."
        color="yellow"
        class="mb-4"
      />
      <ValeForm
        :funcionarios="funcionarios"
        @salvar="handleSalvarVale"
        @cancelar="modalVale = false"
      />
    </AppModal>
  </div>
</template>
