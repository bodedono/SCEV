<script setup lang="ts">
import type { Emprestimo, Vale } from '~/types'

const route = useRoute()
const { isAdmin } = useAuth()
const { buscarComSaldo } = useFuncionarios()

const id = computed(() => Number(route.params.id))

const funcionario = ref<any>(null)
const emprestimos = ref<Emprestimo[]>([])
const vales = ref<Vale[]>([])
const carregando = ref(true)

onMounted(async () => {
  try {
    const supabase = useSupabaseClient()

    // Buscar funcionário com saldo
    funcionario.value = await buscarComSaldo(id.value)

    // Buscar empréstimos
    const { data: empData } = await supabase
      .from('emprestimos')
      .select('*')
      .eq('funcionario_id', id.value)
      .order('created_at', { ascending: false })

    emprestimos.value = empData as Emprestimo[]

    // Buscar vales
    const { data: valeData } = await supabase
      .from('vales')
      .select('*')
      .eq('funcionario_id', id.value)
      .order('created_at', { ascending: false })

    vales.value = valeData as Vale[]
  } finally {
    carregando.value = false
  }
})

const desativarFuncionario = async () => {
  const { desativar } = useFuncionarios()
  await desativar(id.value)
  funcionario.value.ativo = false
}
</script>

<template>
  <div>
    <div class="mb-4">
      <UButton icon="i-lucide-arrow-left" variant="ghost" color="neutral" to="/funcionarios">
        Voltar para lista
      </UButton>
    </div>

    <div v-if="carregando" class="text-center py-12 text-gray-500">
      Carregando funcionário...
    </div>

    <template v-else-if="funcionario">
      <!-- Alerta de saldo devedor ao desativar -->
      <SaldoDevedorAlert
        v-if="!funcionario.ativo"
        :nome="funcionario.nome"
        :saldo="funcionario.saldo_devedor ?? 0"
        class="mb-4"
      />

      <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold">{{ funcionario.nome }}</h1>
        <div v-if="isAdmin" class="flex gap-2">
          <UButton
            v-if="funcionario.ativo"
            variant="soft"
            color="error"
            icon="i-lucide-user-x"
            @click="desativarFuncionario"
          >
            Desativar
          </UButton>
        </div>
      </div>

      <FuncionarioFicha
        :funcionario="funcionario"
        :emprestimos="emprestimos"
        :vales="vales"
      />
    </template>
  </div>
</template>
