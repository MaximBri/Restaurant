<script setup lang="ts">
import { storeToRefs } from 'pinia'

import { useAuthStore } from '../../stores/auth'
import LoadingSpinner from '../ui/LoadingSpinner.vue'

const authStore = useAuthStore()
const { initialized, isAuthenticated } = storeToRefs(authStore)
</script>

<template>
  <LoadingSpinner
    v-if="!initialized"
    message="Проверяем доступ..."
  />

  <RouterView v-else-if="isAuthenticated" />

  <div v-else class="max-w-3xl mx-auto px-4 py-12">
    <div class="rounded-3xl border border-amber-200 bg-white p-8 text-center shadow-sm">
      <p class="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-amber-700">
        Доступ ограничен
      </p>
      <h2 class="text-2xl font-bold text-stone-900">
        Эта страница доступна только зарегистрированным пользователям
      </h2>
      <p class="mt-3 text-sm text-stone-500">
        Войдите в аккаунт, чтобы продолжить.
      </p>

      <div class="mt-6 flex justify-center gap-3">
        <button
          type="button"
          class="rounded-2xl bg-amber-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-amber-800"
          @click="authStore.openAuthModal('login')"
        >
          Войти
        </button>
        <RouterLink
          to="/"
          class="rounded-2xl border border-stone-200 px-5 py-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-50"
        >
          Вернуться в меню
        </RouterLink>
      </div>
    </div>
  </div>
</template>
