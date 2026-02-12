<template>
  <div class="min-h-screen flex">
    <!-- Painel de Branding (visível em lg+) -->
    <div class="hidden lg:flex lg:w-1/2 xl:w-[55%] relative overflow-hidden bg-gradient-to-br from-green-600 via-green-700 to-green-900">
      <!-- Padrão de pontos sutil -->
      <div
        class="absolute inset-0 opacity-10"
        style="background-image: radial-gradient(circle at 25% 25%, white 1px, transparent 1px); background-size: 40px 40px;"
      />

      <!-- Círculos decorativos -->
      <div class="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/5" />
      <div class="absolute -bottom-32 -left-16 w-80 h-80 rounded-full bg-white/5" />

      <!-- Conteúdo -->
      <div class="relative z-10 flex flex-col justify-between p-12 text-white w-full">
        <div>
          <div class="flex items-center gap-3 mb-2">
            <div class="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <UIcon
                name="i-lucide-building-2"
                class="text-2xl"
              />
            </div>
            <span class="text-2xl font-bold tracking-tight">SCEV</span>
          </div>
          <p class="text-green-200 text-sm">
            Sistema de Controle de Empréstimos e Vales
          </p>
        </div>

        <div class="space-y-8">
          <div>
            <h2 class="text-3xl xl:text-4xl font-bold leading-tight">
              Controle financeiro<br>
              <span class="text-green-300">simplificado</span>
            </h2>
            <p class="mt-4 text-green-200 text-lg max-w-md leading-relaxed">
              Gerencie empréstimos e vales dos funcionários do Grupo Do Nô com segurança e praticidade.
            </p>
          </div>

          <!-- Marcas do grupo -->
          <div class="flex flex-wrap gap-3">
            <div
              v-for="brand in ['Bode do Nô', 'Burguer do Nô', 'Italianô']"
              :key="brand"
              class="px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-sm text-green-100 border border-white/10"
            >
              {{ brand }}
            </div>
          </div>
        </div>

        <p class="text-green-300/50 text-xs">
          &copy; {{ new Date().getFullYear() }} Grupo Do Nô &mdash; Todos os direitos reservados
        </p>
      </div>
    </div>

    <!-- Painel do Formulário -->
    <div class="flex-1 flex items-center justify-center p-6 sm:p-12 bg-white dark:bg-gray-950">
      <slot />
    </div>
  </div>
</template>
