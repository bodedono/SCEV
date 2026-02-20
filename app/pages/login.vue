<script setup lang="ts">
definePageMeta({
  layout: 'auth'
})

const supabase = useSupabaseClient()
const { login, carregando } = useAuth()

const form = reactive({
  email: '',
  senha: ''
})

const erro = ref('')
const mostrarSenha = ref(false)

// Forgot password
const modoEsqueceu = ref(false)
const emailReset = ref('')
const resetEnviado = ref(false)
const resetCarregando = ref(false)

const handleLogin = async () => {
  erro.value = ''
  try {
    await login(form.email, form.senha)
    navigateTo('/')
  } catch {
    erro.value = 'Email ou senha incorretos'
  }
}

const handleResetSenha = async () => {
  erro.value = ''
  if (!emailReset.value.trim()) {
    erro.value = 'Informe seu email'
    return
  }
  resetCarregando.value = true
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(emailReset.value.trim(), {
      redirectTo: window.location.origin + '/reset-senha'
    })
    if (error) throw error
    resetEnviado.value = true
  } catch {
    erro.value = 'Erro ao enviar email de redefinição'
  } finally {
    resetCarregando.value = false
  }
}
</script>

<template>
  <div class="w-full max-w-md px-4">
    <!-- Branding mobile -->
    <div class="lg:hidden text-center mb-10">
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
      <p
        class="text-sm mt-1"
        style="color: var(--text-muted);"
      >
        Grupo Do Nô
      </p>
    </div>

    <!-- Boas-vindas desktop -->
    <div class="hidden lg:block mb-10">
      <h1
        class="text-3xl font-semibold tracking-tight"
        style="color: var(--text-main);"
      >
        Bem-vindo de volta
      </h1>
      <p
        class="mt-2"
        style="color: var(--text-secondary);"
      >
        Entre com suas credenciais para continuar.
      </p>
    </div>

    <!-- Modo: Esqueceu a senha -->
    <div v-if="modoEsqueceu" class="space-y-5">
      <template v-if="resetEnviado">
        <div
          class="p-4 rounded-xl"
          style="background-color: var(--status-success-bg, #F0FDF4); border: 1px solid var(--status-success-border, #86EFAC);"
        >
          <div
            class="flex items-center gap-2 mb-2"
            style="color: var(--status-success-text, #166534);"
          >
            <AppIcon name="i-lucide-mail-check" class="text-lg" />
            <span class="font-medium">Email enviado!</span>
          </div>
          <p class="text-sm" style="color: var(--status-success-text, #166534); opacity: 0.8;">
            Verifique sua caixa de entrada e clique no link para redefinir sua senha.
          </p>
        </div>
        <button
          type="button"
          class="btn-login"
          @click="modoEsqueceu = false; resetEnviado = false; emailReset = ''; erro = ''"
        >
          <span>Voltar para Login</span>
        </button>
      </template>

      <form v-else class="space-y-5" @submit.prevent="handleResetSenha">
        <AppFormField label="Email da conta">
          <div class="login-input">
            <AppInput
              v-model="emailReset"
              class="w-full"
              type="email"
              placeholder="seu@email.com"
              size="xl"
              autofocus
            />
          </div>
        </AppFormField>

        <div
          v-if="erro"
          class="p-3 rounded-xl"
          style="background-color: var(--status-error-bg, #FEF2F2); border: 1px solid var(--status-error-border, #FCA5A5);"
        >
          <div class="flex items-center gap-2 text-sm" style="color: var(--status-error-text, #DC2626);">
            <AppIcon name="i-lucide-alert-circle" class="shrink-0" />
            <span>{{ erro }}</span>
          </div>
        </div>

        <button type="submit" class="btn-login" :disabled="resetCarregando">
          <AppIcon v-if="resetCarregando" name="i-lucide-loader-2" class="animate-spin" />
          <span>Enviar Link de Redefinição</span>
          <AppIcon v-if="!resetCarregando" name="i-lucide-arrow-right" />
        </button>

        <p class="text-center text-sm" style="color: var(--text-muted);">
          <a href="#" class="login-link" @click.prevent="modoEsqueceu = false; erro = ''">
            Voltar para login
          </a>
        </p>
      </form>
    </div>

    <!-- Modo: Login normal -->
    <form
      v-else
      class="space-y-5"
      @submit.prevent="handleLogin"
    >
      <AppFormField label="Email corporativo">
        <div class="login-input">
          <AppInput
            v-model="form.email"
            class="w-full"
            type="email"
            placeholder="seu@email.com"
            size="xl"
            autofocus
          />
        </div>
      </AppFormField>

      <div>
        <div class="flex items-center justify-between mb-1.5">
          <label
            class="app-form-label"
            style="margin-bottom: 0;"
          >
            Senha
          </label>
          <a
            href="#"
            class="login-link"
            @click.prevent="modoEsqueceu = true; erro = ''"
          >
            Esqueceu a senha?
          </a>
        </div>
        <div class="login-input">
          <AppInput
            v-model="form.senha"
            class="w-full"
            :type="mostrarSenha ? 'text' : 'password'"
            placeholder="Sua senha"
            size="xl"
          >
            <template #trailing>
              <AppButton
                :icon="mostrarSenha ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                variant="ghost"
                color="neutral"
                size="sm"
                :padded="false"
                @click="mostrarSenha = !mostrarSenha"
              />
            </template>
          </AppInput>
        </div>
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
          <AppButton
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
        <span>Entrar no Sistema</span>
        <AppIcon
          v-if="!carregando"
          name="i-lucide-arrow-right"
        />
      </button>
    </form>

    <!-- Footer -->
    <p
      class="text-center mt-8 text-sm"
      style="color: var(--text-muted);"
    >
      Não tem conta?
      <NuxtLink
        to="/registro"
        class="login-link"
      >
        Cadastre-se
      </NuxtLink>
    </p>
  </div>
</template>
