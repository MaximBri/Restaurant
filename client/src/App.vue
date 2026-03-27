<script setup lang="ts">
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'

import AuthModal from './components/auth/AuthModal.vue'
import AppHeader from './components/layout/AppHeader.vue'
import { useAuthStore } from './stores/auth'

const authStore = useAuthStore()
const { authModalOpen, authModalMode } = storeToRefs(authStore)

onMounted(() => {
  authStore.init()
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <AppHeader
      @login="authStore.openAuthModal('login')"
    />
    <main>
      <RouterView />
    </main>
    <AuthModal
      :open="authModalOpen"
      :initial-mode="authModalMode"
      @close="authStore.closeAuthModal()"
    />
  </div>
</template>
