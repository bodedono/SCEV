<script setup lang="ts">
import { validarCPF, formatarCPF, limparCPF } from '~/utils/cpf'

definePageMeta({
  layout: 'auth'
})

const form = reactive({
  nome: '',
  email: '',
  senha: '',
  confirmarSenha: '',
  cpf: '',
  telefone: '',
  data_nascimento: ''
})

const erro = ref('')
const cpfErro = ref('')
const carregando = ref(false)
const sucesso = ref(false)

const onCpfInput = (event: Event) => {
  const input = event.target as HTMLInputElement
  form.cpf = formatarCPF(input.value)
  cpfErro.value = ''
}

const validarCpfField = () => {
  if (!form.cpf) {
    cpfErro.value = ''
    return true
  }
  const numeros = limparCPF(form.cpf)
  if (numeros.length > 0 && numeros.length < 11) {
    cpfErro.value = 'CPF incompleto'
    return false
  }
  if (numeros.length === 11 && !validarCPF(numeros)) {
    cpfErro.value = 'CPF inválido'
    return false
  }
  cpfErro.value = ''
  return true
}

const handleRegistro = async () => {
  erro.value = ''

  if (!form.nome.trim() || !form.email.trim()) {
    erro.value = 'Nome e email são obrigatórios'
    return
  }
  if (form.senha.length < 6) {
    erro.value = 'Senha deve ter no mínimo 6 caracteres'
    return
  }
  if (form.senha !== form.confirmarSenha) {
    erro.value = 'As senhas não coincidem'
    return
  }
  if (!validarCpfField()) return

  carregando.value = true
  try {
    await $fetch('/api/registro', {
      method: 'POST',
      body: {
        nome: form.nome.trim(),
        email: form.email.trim(),
        senha: form.senha,
        cpf: limparCPF(form.cpf) || null,
        telefone: form.telefone.trim() || null,
        data_nascimento: form.data_nascimento || null
      }
    })
    sucesso.value = true
  } catch (e: unknown) {
    const err = e as Record<string, unknown> | undefined
    const data = err?.data as Record<string, unknown> | undefined
    erro.value = (data?.message as string) || 'Erro ao criar conta. Tente novamente.'
  } finally {
    carregando.value = false
  }
}
</script>

<template>
  <div class="w-full max-w-md px-4">
    <!-- Branding mobile -->
    <div class="lg:hidden text-center mb-8">
      <div
        class="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
        style="background-color: rgba(var(--bg-surface-hover-rgb), 0.8);"
      >
        <AppIcon
          name="i-lucide-building-2"
          class="text-4xl"
          style="color: var(--text-main);"
        />
      </div>
      <h1
        class="text-2xl font-semibold tracking-tight"
        style="color: var(--text-main);"
      >
        SCEV
      </h1>
    </div>

    <!-- Header desktop -->
    <div class="hidden lg:block mb-8">
      <h1
        class="text-3xl font-semibold tracking-tight"
        style="color: var(--text-main);"
      >
        Criar Conta
      </h1>
      <p
        class="mt-2"
        style="color: var(--text-secondary);"
      >
        Preencha seus dados para se cadastrar.
      </p>
    </div>

    <!-- Sucesso -->
    <div
      v-if="sucesso"
      class="space-y-4"
    >
      <div
        class="p-4 rounded-xl"
        style="background-color: var(--status-success-bg, #F0FDF4); border: 1px solid var(--status-success-border, #86EFAC);"
      >
        <div
          class="flex items-center gap-2 mb-2"
          style="color: var(--status-success-text, #166534);"
        >
          <AppIcon
            name="i-lucide-check-circle"
            class="text-lg"
          />
          <span class="font-medium">Conta criada com sucesso!</span>
        </div>
        <p
          class="text-sm"
          style="color: var(--status-success-text, #166534); opacity: 0.8;"
        >
          Verifique seu email para ativar sua conta. Após confirmar, você poderá fazer login.
        </p>
      </div>
      <NuxtLink
        to="/login"
        class="btn-login"
        style="text-decoration: none; display: flex;"
      >
        <span>Ir para Login</span>
        <AppIcon name="i-lucide-arrow-right" />
      </NuxtLink>
    </div>

    <!-- Formulário -->
    <form
      v-else
      class="space-y-4"
      @submit.prevent="handleRegistro"
    >
      <AppFormField
        label="Nome Completo"
        required
      >
        <div class="login-input">
          <AppInput
            v-model="form.nome"
            class="w-full"
            placeholder="Seu nome completo"
            autofocus
          />
        </div>
      </AppFormField>

      <AppFormField
        label="Email"
        required
      >
        <div class="login-input">
          <AppInput
            v-model="form.email"
            class="w-full"
            type="email"
            placeholder="seu@email.com"
          />
        </div>
      </AppFormField>

      <div class="grid grid-cols-2 gap-3">
        <AppFormField label="Senha" required>
          <div class="login-input">
            <AppInput
              v-model="form.senha"
              class="w-full"
              type="password"
              placeholder="Min. 6 caracteres"
            />
          </div>
        </AppFormField>
        <AppFormField label="Confirmar Senha" required>
          <div class="login-input">
            <AppInput
              v-model="form.confirmarSenha"
              class="w-full"
              type="password"
              placeholder="Repita a senha"
            />
          </div>
        </AppFormField>
      </div>

      <AppFormField
        label="CPF"
        :error="cpfErro"
      >
        <div class="login-input">
          <AppInput
            :model-value="form.cpf"
            class="w-full"
            placeholder="000.000.000-00"
            maxlength="14"
            @input="onCpfInput"
            @blur="validarCpfField"
          />
        </div>
      </AppFormField>

      <div class="grid grid-cols-2 gap-3">
        <AppFormField label="Telefone">
          <div class="login-input">
            <AppInput
              v-model="form.telefone"
              class="w-full"
              type="tel"
              placeholder="(00) 00000-0000"
            />
          </div>
        </AppFormField>
        <AppFormField label="Data de Nascimento">
          <div class="login-input">
            <AppInput
              v-model="form.data_nascimento"
              class="w-full"
              type="date"
            />
          </div>
        </AppFormField>
      </div>

      <div
        v-if="erro"
        class="p-3 rounded-xl"
        style="background-color: var(--status-error-bg, #FEF2F2); border: 1px solid var(--status-error-border, #FCA5A5);"
      >
        <div
          class="flex items-center gap-2 text-sm"
          style="color: var(--status-error-text, #DC2626);"
        >
          <AppIcon
            name="i-lucide-alert-circle"
            class="shrink-0"
          />
          <span>{{ erro }}</span>
        </div>
      </div>

      <button
        type="submit"
        class="btn-login"
        :disabled="carregando"
      >
        <AppIcon
          v-if="carregando"
          name="i-lucide-loader-2"
          class="animate-spin"
        />
        <span>Criar Conta</span>
        <AppIcon
          v-if="!carregando"
          name="i-lucide-arrow-right"
        />
      </button>
    </form>

    <!-- Footer -->
    <p
      class="text-center mt-6 text-sm"
      style="color: var(--text-muted);"
    >
      Já tem conta?
      <NuxtLink
        to="/login"
        class="login-link"
      >
        Faça login
      </NuxtLink>
    </p>
  </div>
</template>
