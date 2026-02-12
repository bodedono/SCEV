<script setup lang="ts">
const tab = ref('usuarios')
const tabs = [
  { label: 'Usuários', value: 'usuarios', icon: 'i-lucide-users' },
  { label: 'Unidades', value: 'unidades', icon: 'i-lucide-building-2' }
]
</script>

<template>
  <div>
    <PageHeader titulo="Configurações" descricao="Gerenciar usuários e unidades" />

    <TabBar v-model="tab" :tabs="tabs" />

    <ConfiguracoesUsuariosTab v-if="tab === 'usuarios'" />
    <ConfiguracoesUnidadesTab v-if="tab === 'unidades'" />
  </div>
</template>
