<script setup lang="ts">
const { isGestor, isAdmin, unidadeId } = useAuth()
const { funcionarios, listar: listarFuncionarios } = useFuncionarios()
const { criar } = useEmprestimos()
const { comFeedback } = useToastFeedback()

const handleSalvar = async (dados: any) => {
  const result = await comFeedback(
    () => criar(dados),
    'Empréstimo cadastrado com sucesso',
    'Erro ao cadastrar empréstimo'
  )
  if (result !== null) navigateTo('/emprestimos')
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

    <InfoAlert
      v-if="isGestor"
      message="Este empréstimo precisará ser aprovado pelo Admin antes de gerar as parcelas."
      color="yellow"
    />

    <div class="max-w-2xl rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
      <EmprestimoForm
        :funcionarios="funcionarios"
        @salvar="handleSalvar"
        @cancelar="navigateTo('/emprestimos')"
      />
    </div>
  </div>
</template>
