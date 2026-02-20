<script setup lang="ts">
const { isGestor, unidadeId } = useAuth()
const { funcionarios, listar: listarFuncionarios } = useFuncionarios()
const { criar } = useEmprestimos()
const { comFeedback } = useToastFeedback()

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
      <AppButton
        icon="i-lucide-arrow-left"
        variant="ghost"
        color="neutral"
        to="/emprestimos"
      >
        Voltar
      </AppButton>
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

    <div class="max-w-2xl card p-6">
      <EmprestimoForm
        :funcionarios="funcionarios"
        @salvar="handleSalvar"
        @cancelar="navigateTo('/emprestimos')"
      />
    </div>
  </div>
</template>
