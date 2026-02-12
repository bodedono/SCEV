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
const mostrarSenha = ref(false)

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
    <!-- Branding mobile (escondido em lg+ pois o painel esquerdo já mostra) -->
    <div class="lg:hidden text-center mb-8">
      <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-4">
        <UIcon name="i-lucide-building-2" class="text-primary text-3xl" />
      </div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">SCEV</h1>
      <p class="text-sm text-gray-500 mt-1">Grupo Do Nô</p>
    </div>

    <!-- Boas-vindas desktop -->
    <div class="hidden lg:block mb-8">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Bem-vindo de volta</h1>
      <p class="text-gray-500 mt-1">Entre com suas credenciais para continuar</p>
    </div>

    <form class="space-y-5" @submit.prevent="handleLogin">
      <UFormField label="Email">
        <UInput
          v-model="form.email"
          type="email"
          placeholder="seu@email.com"
          icon="i-lucide-mail"
          size="lg"
          autofocus
        />
      </UFormField>

      <UFormField label="Senha">
        <UInput
          v-model="form.senha"
          :type="mostrarSenha ? 'text' : 'password'"
          placeholder="Sua senha"
          icon="i-lucide-lock"
          size="lg"
        >
          <template #trailing>
            <UButton
              :icon="mostrarSenha ? 'i-lucide-eye-off' : 'i-lucide-eye'"
              variant="ghost"
              color="neutral"
              size="xs"
              :padded="false"
              @click="mostrarSenha = !mostrarSenha"
            />
          </template>
        </UInput>
      </UFormField>

      <div v-if="erro" class="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
        <div class="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
          <UIcon name="i-lucide-alert-circle" class="shrink-0" />
          <span>{{ erro }}</span>
          <UButton
            icon="i-lucide-x"
            variant="ghost"
            color="error"
            size="xs"
            :padded="false"
            class="ml-auto"
            @click="erro = ''"
          />
        </div>
      </div>

      <UButton
        type="submit"
        block
        size="lg"
        :loading="carregando"
        icon="i-lucide-log-in"
        trailing
      >
        Entrar
      </UButton>
    </form>
  </div>
</template>
