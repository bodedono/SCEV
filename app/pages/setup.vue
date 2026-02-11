<script setup lang="ts">
definePageMeta({
  layout: 'auth'
})

const { login } = useAuth()

const etapa = ref<'form' | 'sucesso' | 'erro'>('form')
const mensagem = ref('')
const carregando = ref(false)

const form = reactive({
  nome: '',
  email: '',
  senha: ''
})

const criarAdmin = async () => {
  if (!form.nome.trim() || !form.email.trim() || form.senha.length < 6) return

  carregando.value = true
  try {
    const resultado = await $fetch('/api/setup', {
      method: 'POST',
      body: form
    })
    mensagem.value = resultado.message
    etapa.value = 'sucesso'
  } catch (e: any) {
    mensagem.value = e.data?.message || e.message || 'Erro desconhecido'
    etapa.value = 'erro'
  } finally {
    carregando.value = false
  }
}

const entrar = async () => {
  carregando.value = true
  try {
    await login(form.email, form.senha)
    navigateTo('/')
  } catch {
    mensagem.value = 'Erro ao fazer login'
  } finally {
    carregando.value = false
  }
}
</script>

<template>
  <div class="w-full max-w-md">
    <div class="text-center mb-8">
      <div class="flex items-center justify-center gap-3 mb-4">
        <UIcon name="i-lucide-shield-check" class="text-primary text-4xl" />
      </div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Setup Inicial</h1>
      <p class="text-sm text-gray-500 mt-1">SCEV - Criar primeiro administrador</p>
    </div>

    <div class="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
      <!-- Formulario -->
      <form v-if="etapa === 'form'" class="space-y-4" @submit.prevent="criarAdmin">
        <div class="p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 text-sm text-blue-600 dark:text-blue-400 flex items-start gap-2">
          <UIcon name="i-lucide-info" class="mt-0.5 shrink-0" />
          <p>Crie o primeiro administrador do sistema. Este usuário terá acesso total.</p>
        </div>

        <UFormField label="Nome" required>
          <UInput v-model="form.nome" placeholder="Seu nome completo" icon="i-lucide-user" autofocus />
        </UFormField>

        <UFormField label="Email" required>
          <UInput v-model="form.email" type="email" placeholder="admin@email.com" icon="i-lucide-mail" />
        </UFormField>

        <UFormField label="Senha" required hint="Mínimo 6 caracteres">
          <UInput v-model="form.senha" type="password" placeholder="Senha segura" icon="i-lucide-lock" />
        </UFormField>

        <UButton type="submit" block :loading="carregando" :disabled="!form.nome.trim() || !form.email.trim() || form.senha.length < 6">
          Criar Administrador
        </UButton>

        <p class="text-center text-xs text-gray-400 mt-2">
          Já tem admin?
          <NuxtLink to="/login" class="text-primary hover:underline">Fazer login</NuxtLink>
        </p>
      </form>

      <!-- Sucesso -->
      <div v-if="etapa === 'sucesso'" class="text-center space-y-4">
        <UIcon name="i-lucide-check-circle" class="text-green-500 text-5xl" />
        <p class="text-lg font-semibold text-green-700 dark:text-green-400">{{ mensagem }}</p>
        <p class="text-sm text-gray-500">Clique abaixo para entrar no sistema.</p>
        <UButton block :loading="carregando" @click="entrar">
          Entrar no SCEV
        </UButton>
      </div>

      <!-- Erro -->
      <div v-if="etapa === 'erro'" class="space-y-4">
        <div class="p-4 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
          <div class="flex items-start gap-2">
            <UIcon name="i-lucide-alert-circle" class="text-red-500 mt-0.5 shrink-0" />
            <p class="text-sm text-red-600 dark:text-red-400">{{ mensagem }}</p>
          </div>
        </div>
        <UButton block variant="soft" @click="etapa = 'form'">
          Tentar Novamente
        </UButton>
      </div>
    </div>
  </div>
</template>
