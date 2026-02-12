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
  <div class="w-full max-w-sm">
    <!-- Branding mobile -->
    <div class="lg:hidden text-center mb-8">
      <div class="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 mb-4">
        <UIcon name="i-lucide-shield-check" class="text-primary text-3xl" />
      </div>
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Setup Inicial</h1>
      <p class="text-sm text-gray-500 mt-1">SCEV - Criar primeiro administrador</p>
    </div>

    <!-- Título desktop -->
    <div class="hidden lg:block mb-8">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Setup Inicial</h1>
      <p class="text-gray-500 mt-1">Criar o primeiro administrador do sistema</p>
    </div>

    <!-- Formulário -->
    <form v-if="etapa === 'form'" class="space-y-5" @submit.prevent="criarAdmin">
      <InfoAlert
        message="Crie o primeiro administrador do sistema. Este usuário terá acesso total."
        color="blue"
        icon="i-lucide-info"
      />

      <UFormField label="Nome" required>
        <UInput v-model="form.nome" placeholder="Seu nome completo" icon="i-lucide-user" size="lg" autofocus />
      </UFormField>

      <UFormField label="Email" required>
        <UInput v-model="form.email" type="email" placeholder="admin@email.com" icon="i-lucide-mail" size="lg" />
      </UFormField>

      <UFormField label="Senha" required hint="Mínimo 6 caracteres">
        <UInput v-model="form.senha" type="password" placeholder="Senha segura" icon="i-lucide-lock" size="lg" />
      </UFormField>

      <UButton
        type="submit"
        block
        size="lg"
        :loading="carregando"
        :disabled="!form.nome.trim() || !form.email.trim() || form.senha.length < 6"
        icon="i-lucide-shield-check"
        trailing
      >
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
      <UButton block size="lg" :loading="carregando" icon="i-lucide-log-in" trailing @click="entrar">
        Entrar no SCEV
      </UButton>
    </div>

    <!-- Erro -->
    <div v-if="etapa === 'erro'" class="space-y-4">
      <InfoAlert :message="mensagem" color="red" icon="i-lucide-alert-circle" />
      <UButton block size="lg" variant="soft" @click="etapa = 'form'">
        Tentar Novamente
      </UButton>
    </div>
  </div>
</template>
