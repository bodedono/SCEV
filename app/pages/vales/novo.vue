<script setup lang="ts">
const { isGestor, unidadeId } = useAuth()
const { funcionarios, listar: listarFuncionarios } = useFuncionarios()
const { criar } = useVales()
const { comFeedback } = useToastFeedback()

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleSalvar = async (dados: any) => {
  const result = await comFeedback(
    () => criar(dados),
    'Vale cadastrado com sucesso',
    'Erro ao cadastrar vale'
  )
  if (result !== null) navigateTo('/vales')
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
        to="/vales"
      >
        Voltar
      </AppButton>
    </div>

    <PageHeader
      titulo="Novo Vale"
      :descricao="isGestor ? 'O vale será enviado para aprovação do Admin' : 'Registrar novo vale'"
    />

    <InfoAlert
      v-if="isGestor"
      message="Este vale precisará ser aprovado pelo Admin."
      color="yellow"
    />

    <div class="max-w-2xl card p-6">
      <ValeForm
        :funcionarios="funcionarios"
        @salvar="handleSalvar"
        @cancelar="navigateTo('/vales')"
      />
    </div>
  </div>
</template>
