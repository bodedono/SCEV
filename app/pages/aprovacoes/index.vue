<script setup lang="ts">
import type { Aprovacao } from '~/types'

const supabase = useSupabaseClient()
const { aprovar: aprovarEmp, rejeitar: rejeitarEmp } = useEmprestimos()
const { aprovar: aprovarVale, rejeitar: rejeitarVale } = useVales()

const pendencias = ref<Aprovacao[]>([])
const carregando = ref(true)

const carregarPendencias = async () => {
  carregando.value = true
  try {
    // Empréstimos pendentes
    const { data: emps } = await supabase
      .from('emprestimos')
      .select(`
        id, valor_total, created_at,
        funcionario:funcionarios(id, nome, matricula, unidade_id, unidade:unidades(id, nome)),
        usuario_cadastro:usuarios!emprestimos_usuario_cadastro_id_fkey(id, nome)
      `)
      .eq('status', 'PENDENTE_APROVACAO')
      .order('created_at', { ascending: false })

    const empAprov: Aprovacao[] = (emps ?? []).map((e: any) => ({
      id: e.id,
      tipo: 'EMPRESTIMO' as const,
      funcionario: e.funcionario,
      valor: e.valor_total,
      data: e.created_at,
      solicitante: e.usuario_cadastro
    }))

    // Vales pendentes
    const { data: vals } = await supabase
      .from('vales')
      .select(`
        id, valor, created_at,
        funcionario:funcionarios(id, nome, matricula, unidade_id, unidade:unidades(id, nome)),
        usuario_cadastro:usuarios!vales_usuario_cadastro_id_fkey(id, nome)
      `)
      .eq('status', 'PENDENTE_APROVACAO')
      .order('created_at', { ascending: false })

    const valeAprov: Aprovacao[] = (vals ?? []).map((v: any) => ({
      id: v.id,
      tipo: 'VALE' as const,
      funcionario: v.funcionario,
      valor: v.valor,
      data: v.created_at,
      solicitante: v.usuario_cadastro
    }))

    pendencias.value = [...empAprov, ...valeAprov].sort(
      (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()
    )
  } finally {
    carregando.value = false
  }
}

const handleAprovar = async (id: number, tipo: string) => {
  if (tipo === 'EMPRESTIMO') await aprovarEmp(id)
  else await aprovarVale(id)
  await carregarPendencias()
}

const handleRejeitar = async (id: number, tipo: string) => {
  if (tipo === 'EMPRESTIMO') await rejeitarEmp(id)
  else await rejeitarVale(id)
  await carregarPendencias()
}

onMounted(() => carregarPendencias())
</script>

<template>
  <div>
    <PageHeader titulo="Pendências de Aprovação" descricao="Empréstimos e vales aguardando sua aprovação" />

    <div v-if="carregando" class="text-center py-12 text-gray-500">Carregando...</div>

    <div v-else-if="pendencias.length === 0" class="text-center py-12">
      <UIcon name="i-lucide-check-circle-2" class="text-4xl text-green-500 mb-3" />
      <p class="text-gray-500">Nenhuma pendência de aprovação</p>
    </div>

    <div v-else class="space-y-3">
      <AprovacaoCard
        v-for="item in pendencias"
        :key="`${item.tipo}-${item.id}`"
        :item="item"
        @aprovar="handleAprovar"
        @rejeitar="handleRejeitar"
      />
    </div>
  </div>
</template>
