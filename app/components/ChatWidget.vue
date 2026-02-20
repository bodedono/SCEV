<script setup lang="ts">
const { mensagens, aberto, enviando, toggle, enviarMensagem, limparConversa } = useChatbot()
const { usuario } = useAuth()

const input = ref('')
const messagesContainer = ref<HTMLElement | null>(null)

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

const handleEnviar = () => {
  if (!input.value.trim()) return
  enviarMensagem(input.value)
  input.value = ''
  scrollToBottom()
}

watch(
  () => mensagens.value.length,
  () => scrollToBottom()
)

watch(aberto, (open) => {
  if (open) scrollToBottom()
})
</script>

<template>
  <!-- Painel do Chat -->
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="opacity-0 scale-95 translate-y-4"
    enter-to-class="opacity-100 scale-100 translate-y-0"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="opacity-100 scale-100 translate-y-0"
    leave-to-class="opacity-0 scale-95 translate-y-4"
  >
    <div
      v-if="aberto"
      class="fixed bottom-24 right-6 z-50 w-[380px] max-sm:left-4 max-sm:right-4 max-sm:w-auto flex flex-col rounded-2xl border shadow-2xl"
      style="background-color: var(--bg-surface); border-color: var(--border-subtle); height: 500px; max-height: calc(100vh - 140px);"
    >
      <!-- Header -->
      <div
        class="flex items-center gap-3 px-4 py-3 border-b shrink-0"
        style="border-color: var(--border-subtle);"
      >
        <div class="flex items-center justify-center w-9 h-9 rounded-xl bg-primary/10">
          <AppIcon
            name="i-lucide-bot"
            class="text-primary text-lg"
          />
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm font-semibold truncate">
            Assistente SCEV
          </p>
          <p
            class="text-xs"
            style="color: var(--text-muted);"
          >
            Especialista do sistema
          </p>
        </div>
        <AppButton
          icon="i-lucide-trash-2"
          variant="ghost"
          color="neutral"
          size="xs"
          title="Limpar conversa"
          @click="limparConversa"
        />
        <AppButton
          icon="i-lucide-x"
          variant="ghost"
          color="neutral"
          size="xs"
          @click="toggle"
        />
      </div>

      <!-- Mensagens -->
      <div
        ref="messagesContainer"
        class="flex-1 overflow-y-auto p-4 space-y-4"
      >
        <div
          v-for="msg in mensagens"
          :key="msg.id"
          class="flex gap-2"
          :class="msg.role === 'user' ? 'justify-end' : 'justify-start'"
        >
          <!-- Avatar assistente -->
          <div
            v-if="msg.role === 'assistant'"
            class="flex items-end shrink-0"
          >
            <div class="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
              <AppIcon
                name="i-lucide-bot"
                class="text-primary text-sm"
              />
            </div>
          </div>

          <!-- Bolha -->
          <div
            class="max-w-[80%] px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap"
            :class="msg.role === 'user'
              ? 'chat-bubble-user'
              : 'chat-bubble-bot'"
          >
            {{ msg.content }}
          </div>

          <!-- Avatar usuário -->
          <div
            v-if="msg.role === 'user'"
            class="flex items-end shrink-0"
          >
            <AppAvatar
              :label="usuario?.nome?.charAt(0) ?? 'U'"
              size="xs"
            />
          </div>
        </div>

        <!-- Indicador digitando -->
        <div
          v-if="enviando"
          class="flex gap-2 justify-start"
        >
          <div class="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <AppIcon
              name="i-lucide-bot"
              class="text-primary text-sm"
            />
          </div>
          <div class="chat-bubble-bot px-4 py-3 flex items-center gap-1">
            <span class="w-2 h-2 chat-typing-dot rounded-full animate-bounce [animation-delay:0ms]" />
            <span class="w-2 h-2 chat-typing-dot rounded-full animate-bounce [animation-delay:150ms]" />
            <span class="w-2 h-2 chat-typing-dot rounded-full animate-bounce [animation-delay:300ms]" />
          </div>
        </div>
      </div>

      <!-- Input -->
      <div
        class="p-3 border-t shrink-0"
        style="border-color: var(--border-subtle);"
      >
        <form
          class="flex items-center gap-2"
          @submit.prevent="handleEnviar"
        >
          <AppInput
            v-model="input"
            placeholder="Digite sua pergunta..."
            class="flex-1"
            :disabled="enviando"
            autofocus
          />
          <AppButton
            type="submit"
            icon="i-lucide-send"
            :disabled="!input.trim() || enviando"
            :loading="enviando"
            size="sm"
          />
        </form>
      </div>
    </div>
  </Transition>

  <!-- FAB -->
  <button
    class="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center"
    style="background-color: var(--clr-primary); color: var(--clr-primary-fg);"
    @click="toggle"
  >
    <Transition
      enter-active-class="transition duration-200"
      enter-from-class="rotate-90 opacity-0"
      enter-to-class="rotate-0 opacity-100"
      leave-active-class="transition duration-150"
      leave-from-class="rotate-0 opacity-100"
      leave-to-class="-rotate-90 opacity-0"
      mode="out-in"
    >
      <AppIcon
        v-if="!aberto"
        key="open"
        name="i-lucide-message-circle"
        class="text-2xl"
      />
      <AppIcon
        v-else
        key="close"
        name="i-lucide-x"
        class="text-2xl"
      />
    </Transition>
  </button>
</template>
