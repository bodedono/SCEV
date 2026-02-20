<template>
  <div class="min-h-screen flex">
    <!-- Painel de Branding (visível em lg+) -->
    <div class="hidden lg:flex lg:w-1/2 xl:w-[55%] relative overflow-hidden auth-brand-gradient">
      <!-- Padrão de grid sutil -->
      <div
        class="absolute inset-0 opacity-[0.03]"
        style="background-image: linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px); background-size: 48px 48px;"
      />

      <!-- Círculos decorativos -->
      <div class="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/[0.03]" />
      <div class="absolute -bottom-32 -left-16 w-80 h-80 rounded-full bg-white/[0.03]" />

      <!-- Conteúdo -->
      <div class="relative z-10 flex flex-col justify-between p-12 text-white w-full">
        <div>
          <div class="flex items-center gap-3 mb-2">
            <div class="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
              <AppIcon
                name="i-lucide-building-2"
                class="text-2xl"
              />
            </div>
            <span class="text-2xl font-semibold tracking-tight">
              SCEV
            </span>
          </div>
          <p class="text-stone-400 text-sm">
            Sistema de Controle de Empréstimos e Vales
          </p>
        </div>

        <div class="space-y-8">
          <div>
            <h2 class="text-3xl xl:text-4xl font-semibold leading-tight tracking-tight">
              Controle financeiro<br>
              <span class="text-amber-300">simplificado</span>
            </h2>
            <p class="mt-4 text-stone-300 text-lg max-w-md leading-relaxed">
              Gerencie empréstimos e vales dos funcionários do Grupo Do Nô com segurança e praticidade.
            </p>
          </div>

          <!-- Marcas do grupo -->
          <div class="flex flex-wrap gap-3">
            <div
              v-for="brand in ['Bode do Nô', 'Burguer do Nô', 'Italianô']"
              :key="brand"
              class="px-4 py-2 rounded-full bg-white/[0.06] backdrop-blur-sm text-sm text-stone-300 border border-white/[0.08]"
            >
              {{ brand }}
            </div>
          </div>
        </div>

        <p class="text-stone-500 text-xs">
          &copy; {{ new Date().getFullYear() }} Grupo Do Nô &mdash; Todos os direitos reservados
        </p>
      </div>
    </div>

    <!-- Painel do Formulário -->
    <div
      class="flex-1 flex items-center justify-center p-6 sm:p-12"
      style="background-color: var(--bg-page);"
    >
      <slot />
    </div>
    <AppToastContainer />
  </div>
</template>
