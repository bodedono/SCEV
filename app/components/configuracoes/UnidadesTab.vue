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
      <AppButton
        icon="i-lucide-plus"
        @click="modalUnidade = true"
      >
        Nova Unidade
      </AppButton>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="unidade in unidades"
        :key="unidade.id"
        class="card p-4 flex items-center gap-3"
      >
        <div class="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
          <AppIcon name="i-lucide-building-2" />
        </div>
        <p class="flex-1 font-medium">
          {{ unidade.nome }}
        </p>
        <AppBadge
          :color="unidade.ativo ? 'success' : 'error'"
          variant="subtle"
          size="xs"
        >
          {{ unidade.ativo ? 'Ativa' : 'Inativa' }}
        </AppBadge>
      </div>
    </div>

    <div
      v-if="unidades.length === 0"
      class="flex flex-col items-center justify-center py-16 text-stone-400 dark:text-stone-500"
    >
      <AppIcon
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
      <AppFormField
        label="Nome da Unidade"
        required
      >
        <AppInput
          v-model="novaUnidade.nome"
          placeholder="Ex: Bode do Nô"
        />
      </AppFormField>

      <template #footer>
        <div class="flex justify-end gap-2">
          <AppButton
            variant="outline"
            color="neutral"
            @click="modalUnidade = false"
          >
            Cancelar
          </AppButton>
          <AppButton
            icon="i-lucide-check"
            @click="handleCriarUnidade"
          >
            Criar Unidade
          </AppButton>
        </div>
      </template>
    </AppModal>
  </div>
</template>
