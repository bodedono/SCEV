<script setup lang="ts">
const { isGestor, isAdmin, unidadeId } = useAuth()
const { funcionarios, listar: listarFuncionarios } = useFuncionarios()
const { criar } = useEmprestimos()

const handleSalvar = async (dados: any) => {
  await criar(dados)
  navigateTo('/emprestimos')
}

onMounted(() => {
  listarFuncionarios(isGestor.value ? unidadeId.value ?? undefined : undefined)
})
</script>

<template>
  <div>
    <div class="mb-4">
      <UButton icon="i-lucide-arrow-left" variant="ghost" color="neutral" to="/emprestimos">
        Voltar
      </UButton>
    </div>

    <PageHeader
      titulo="Novo Empréstimo"
      :descricao="isGestor ? 'O empréstimo será enviado para aprovação do Admin' : 'Cadastrar novo empréstimo'"
    />

    <div v-if="isGestor" class="mb-6 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800">
      <div class="flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
        <UIcon name="i-lucide-info" />
        <p class="text-sm">Este empréstimo precisará ser aprovado pelo Admin antes de gerar as parcelas.</p>
      </div>
    </div>

    <div class="max-w-2xl rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
      <EmprestimoForm
        :funcionarios="funcionarios"
        @salvar="handleSalvar"
        @cancelar="navigateTo('/emprestimos')"
      />
    </div>
  </div>
</template>
