<script setup lang="ts">
const { isGestor, unidadeId } = useAuth()
const { funcionarios, listar: listarFuncionarios } = useFuncionarios()
const { criar } = useVales()

const handleSalvar = async (dados: any) => {
  await criar(dados)
  navigateTo('/vales')
}

onMounted(() => {
  listarFuncionarios(isGestor.value ? unidadeId.value ?? undefined : undefined)
})
</script>

<template>
  <div>
    <div class="mb-4">
      <UButton icon="i-lucide-arrow-left" variant="ghost" color="neutral" to="/vales">
        Voltar
      </UButton>
    </div>

    <PageHeader
      titulo="Novo Vale"
      :descricao="isGestor ? 'O vale será enviado para aprovação do Admin' : 'Registrar novo vale'"
    />

    <div v-if="isGestor" class="mb-6 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800">
      <div class="flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
        <UIcon name="i-lucide-info" />
        <p class="text-sm">Este vale precisará ser aprovado pelo Admin.</p>
      </div>
    </div>

    <div class="max-w-2xl rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
      <ValeForm
        :funcionarios="funcionarios"
        @salvar="handleSalvar"
        @cancelar="navigateTo('/vales')"
      />
    </div>
  </div>
</template>
