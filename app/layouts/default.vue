<script setup lang="ts">
const sidebarAberta = ref(true)
</script>

<template>
  <div
    class="min-h-screen flex"
    style="background-color: var(--bg-page);"
  >
    <AppSidebar :aberta="sidebarAberta" />

    <div class="flex-1 flex flex-col min-w-0">
      <AppHeader
        :sidebar-aberta="sidebarAberta"
        @toggle-sidebar="sidebarAberta = !sidebarAberta"
      />

      <main class="flex-1 p-6 overflow-y-auto">
        <slot />
      </main>
    </div>

    <ChatWidget />
    <AppToastContainer />
  </div>
</template>
