<script setup lang="ts">
definePageMeta({
  layout: 'auth'
})

const { login, carregando } = useAuth()

const form = reactive({
  email: '',
  senha: ''
})

const erro = ref('')

const handleLogin = async () => {
  erro.value = ''
  try {
    await login(form.email, form.senha)
    navigateTo('/')
  } catch (e: any) {
    erro.value = 'Email ou senha incorretos'
  }
}
</script>

<template>
  <div class="w-full max-w-sm">
    <div class="text-center mb-8">
      <div class="flex items-center justify-center gap-3 mb-4">
        <UIcon name="i-lucide-building-2" class="text-primary text-4xl" />
      </div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">SCEV</h1>
      <p class="text-sm text-gray-500 mt-1">Sistema de Controle de Empréstimos e Vales</p>
      <p class="text-xs text-gray-400 mt-1">Grupo Do Nô</p>
    </div>

    <div class="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
      <form class="space-y-4" @submit.prevent="handleLogin">
        <UFormField label="Email">
          <UInput
            v-model="form.email"
            type="email"
            placeholder="seu@email.com"
            icon="i-lucide-mail"
            autofocus
          />
        </UFormField>

        <UFormField label="Senha">
          <UInput
            v-model="form.senha"
            type="password"
            placeholder="Sua senha"
            icon="i-lucide-lock"
          />
        </UFormField>

        <div v-if="erro" class="text-sm text-red-600 flex items-center gap-2">
          <UIcon name="i-lucide-alert-circle" />
          {{ erro }}
        </div>

        <UButton type="submit" block :loading="carregando">
          Entrar
        </UButton>
      </form>
    </div>
  </div>
</template>
