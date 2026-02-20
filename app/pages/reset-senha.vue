<script setup lang="ts">
definePageMeta({
  layout: 'auth'
})

const supabase = useSupabaseClient()

const novaSenha = ref('')
const confirmarSenha = ref('')
const erro = ref('')
const carregando = ref(false)
const sucesso = ref(false)

const handleReset = async () => {
  erro.value = ''

  if (novaSenha.value.length < 6) {
    erro.value = 'Senha deve ter no mínimo 6 caracteres'
    return
  }
  if (novaSenha.value !== confirmarSenha.value) {
    erro.value = 'As senhas não coincidem'
    return
  }

  carregando.value = true
  try {
    const { error } = await supabase.auth.updateUser({
      password: novaSenha.value
    })
    if (error) throw error
    sucesso.value = true
  } catch (e: unknown) {
    const err = e as Record<string, string> | undefined
    erro.value = err?.message || 'Erro ao redefinir senha. O link pode ter expirado.'
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
        Nova Senha
      </h1>
      <p
        class="mt-2"
        style="color: var(--text-secondary);"
      >
        Defina sua nova senha de acesso.
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
          <span class="font-medium">Senha redefinida com sucesso!</span>
        </div>
        <p
          class="text-sm"
          style="color: var(--status-success-text, #166534); opacity: 0.8;"
        >
          Você já pode fazer login com a nova senha.
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
      class="space-y-5"
      @submit.prevent="handleReset"
    >
      <AppFormField
        label="Nova Senha"
        required
        hint="Mínimo 6 caracteres"
      >
        <div class="login-input">
          <AppInput
            v-model="novaSenha"
            class="w-full"
            type="password"
            placeholder="Sua nova senha"
            size="xl"
            autofocus
          />
        </div>
      </AppFormField>

      <AppFormField
        label="Confirmar Nova Senha"
        required
      >
        <div class="login-input">
          <AppInput
            v-model="confirmarSenha"
            class="w-full"
            type="password"
            placeholder="Repita a nova senha"
            size="xl"
          />
        </div>
      </AppFormField>

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
        <span>Redefinir Senha</span>
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
      <NuxtLink
        to="/login"
        class="login-link"
      >
        Voltar para login
      </NuxtLink>
    </p>
  </div>
</template>
