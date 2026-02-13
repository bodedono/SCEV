<script setup lang="ts">
const { unidades, listar: listarUnidades, criar: criarUnidade } = useUnidades()
const { comFeedback } = useToastFeedback()

const modalUnidade = ref(false)
const novaUnidade = reactive({ nome: '' })

const handleCriarUnidade = async () => {
  await comFeedback(
    () => criarUnidade(novaUnidade.nome),
    'Unidade criada com sucesso',
    'Erro ao criar unidade'
  )
  modalUnidade.value = false
  novaUnidade.nome = ''
  await listarUnidades()
}

onMounted(() => listarUnidades())
</script>

<template>
  <div>
    <div class="flex justify-end mb-4">
      <UButton
        icon="i-lucide-plus"
        @click="modalUnidade = true"
      >
        Nova Unidade
      </UButton>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="unidade in unidades"
        :key="unidade.id"
        class="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 flex items-center gap-3"
      >
        <div class="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
          <UIcon name="i-lucide-building-2" />
        </div>
        <p class="flex-1 font-medium">
          {{ unidade.nome }}
        </p>
        <UBadge
          :color="unidade.ativo ? 'success' : 'error'"
          variant="subtle"
          size="xs"
        >
          {{ unidade.ativo ? 'Ativa' : 'Inativa' }}
        </UBadge>
      </div>
    </div>

    <div
      v-if="unidades.length === 0"
      class="flex flex-col items-center justify-center py-16 text-gray-400 dark:text-gray-500"
    >
      <UIcon
        name="i-lucide-building-2"
        class="text-3xl mb-3"
      />
      <p class="text-sm">
        Nenhuma unidade cadastrada
      </p>
    </div>

    <AppModal
      v-model:open="modalUnidade"
      title="Nova Unidade"
      icon="i-lucide-building-2"
    >
      <UFormField
        label="Nome da Unidade"
        required
      >
        <UInput
          v-model="novaUnidade.nome"
          placeholder="Ex: Bode do Nô"
        />
      </UFormField>

      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton
            variant="outline"
            color="neutral"
            @click="modalUnidade = false"
          >
            Cancelar
          </UButton>
          <UButton
            icon="i-lucide-check"
            @click="handleCriarUnidade"
          >
            Criar Unidade
          </UButton>
        </div>
      </template>
    </AppModal>
  </div>
</template>
