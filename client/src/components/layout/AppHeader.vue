<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import { useAuthStore } from '../../stores/auth'

const route = useRoute()
const authStore = useAuthStore()
const mobileMenuOpen = ref(false)

const emit = defineEmits<{
  login: []
}>()

watch(
  () => route.fullPath,
  () => {
    mobileMenuOpen.value = false
  },
)

async function handleLogout() {
  try {
    await authStore.logout()
    mobileMenuOpen.value = false
  } catch {
    // Error is displayed in the store-bound UI when needed.
  }
}
</script>

<template>
  <header class="bg-amber-900 text-white shadow-lg">
    <div class="mx-auto max-w-7xl px-4 py-4">
      <div class="flex items-center justify-between gap-4">
        <RouterLink
          to="/"
          class="flex items-center gap-3 transition-opacity hover:opacity-90"
        >
          <img src="/icons/dishes.svg" width="14" height="14" alt="logo" class="text-2xl" />
          <div>
            <h1 class="text-lg font-bold leading-tight sm:text-xl">Русский ресторан</h1>
          </div>
        </RouterLink>

        <button
          type="button"
          class="flex h-10 w-10 items-center justify-center rounded-lg border border-white/20 transition-colors hover:bg-amber-800 md:hidden"
          :aria-expanded="mobileMenuOpen"
          aria-label="Открыть меню"
          @click="mobileMenuOpen = !mobileMenuOpen"
        >
          <span class="flex flex-col gap-1.5">
            <span class="block h-0.5 w-5 rounded bg-white"></span>
            <span class="block h-0.5 w-5 rounded bg-white"></span>
            <span class="block h-0.5 w-5 rounded bg-white"></span>
          </span>
        </button>

        <nav class="hidden items-center gap-2 md:flex">
          <RouterLink
            to="/"
            class="rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-amber-800 sm:px-4"
            :class="{ 'bg-amber-800': route.name === 'menu' }"
          >
            Меню
          </RouterLink>
          <RouterLink
            v-if="authStore.isAuthenticated"
            to="/booking"
            class="rounded-lg bg-amber-600 px-3 py-2 text-sm font-medium transition-colors hover:bg-amber-500 sm:px-4"
          >
            Забронировать столик
          </RouterLink>
          <RouterLink
            v-if="authStore.user?.role === 'ADMIN'"
            to="/admin/bookings"
            class="rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-amber-800 sm:px-4"
            :class="{ 'bg-amber-800': route.name === 'admin-bookings' }"
          >
            Админка
          </RouterLink>

          <template v-if="authStore.isAuthenticated && authStore.user">
            <div class="ml-2 rounded-xl bg-amber-950/50 px-4 py-2 text-right">
              <p class="text-sm font-semibold">{{ authStore.user.name }}</p>
              <p class="text-xs text-amber-100/80">
                {{ authStore.user.role === 'ADMIN' ? 'Администратор' : authStore.user.email }}
              </p>
            </div>
            <button
              type="button"
              class="rounded-lg border border-white/20 px-3 py-2 text-sm font-medium transition-colors hover:bg-amber-800 sm:px-4"
              @click="handleLogout"
            >
              Выйти
            </button>
          </template>

          <template v-else>
            <button
              type="button"
              class="rounded-lg bg-white px-3 py-2 text-sm font-semibold text-amber-900 transition-colors hover:bg-amber-100 sm:px-4"
              @click="emit('login')"
            >
              Войти
            </button>
          </template>
        </nav>
      </div>
    </div>
  </header>

  <Transition
    enter-active-class="transition-opacity duration-200"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition-opacity duration-200"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <button
      v-if="mobileMenuOpen"
      type="button"
      class="fixed inset-0 z-40 bg-black/40 md:hidden"
      aria-label="Закрыть меню"
      @click="mobileMenuOpen = false"
    ></button>
  </Transition>

  <Transition
    enter-active-class="transform transition duration-200 ease-out"
    enter-from-class="translate-x-full"
    enter-to-class="translate-x-0"
    leave-active-class="transform transition duration-200 ease-in"
    leave-from-class="translate-x-0"
    leave-to-class="translate-x-full"
  >
    <aside
      v-if="mobileMenuOpen"
      class="fixed right-0 top-0 z-50 flex h-full w-full max-w-xs flex-col bg-amber-950 text-white shadow-2xl md:hidden"
    >
      <div class="flex items-center justify-between border-b border-white/10 px-4 py-4">
        <div>
          <p class="text-xs uppercase tracking-[0.3em] text-amber-200/80">Меню</p>
          <p class="text-sm font-semibold">Русский ресторан</p>
        </div>
        <button
          type="button"
          class="flex h-10 w-10 items-center justify-center rounded-lg border border-white/20 transition-colors hover:bg-white/10"
          aria-label="Закрыть меню"
          @click="mobileMenuOpen = false"
        >
          <span class="text-xl leading-none">×</span>
        </button>
      </div>

      <div class="flex-1 space-y-2 overflow-y-auto px-4 py-4">
        <RouterLink
          to="/"
          class="block rounded-lg px-4 py-3 text-sm font-medium transition-colors hover:bg-amber-800"
          :class="{ 'bg-amber-800': route.name === 'menu' }"
        >
          Меню
        </RouterLink>
        <RouterLink
          v-if="authStore.isAuthenticated"
          to="/booking"
          class="block rounded-lg bg-amber-600 px-4 py-3 text-sm font-medium transition-colors hover:bg-amber-500"
        >
          Забронировать столик
        </RouterLink>
        <RouterLink
          v-if="authStore.user?.role === 'ADMIN'"
          to="/admin/bookings"
          class="block rounded-lg px-4 py-3 text-sm font-medium transition-colors hover:bg-amber-800"
          :class="{ 'bg-amber-800': route.name === 'admin-bookings' }"
        >
          Админка
        </RouterLink>
      </div>

      <div class="border-t border-white/10 px-4 py-4">
        <template v-if="authStore.isAuthenticated && authStore.user">
          <div class="mb-3 rounded-xl bg-white/5 px-4 py-3 text-left">
            <p class="text-sm font-semibold">{{ authStore.user.name }}</p>
            <p class="text-xs text-amber-100/80">
              {{ authStore.user.role === 'ADMIN' ? 'Администратор' : authStore.user.email }}
            </p>
          </div>
          <button
            type="button"
            class="block w-full rounded-lg border border-white/20 px-4 py-3 text-left text-sm font-medium transition-colors hover:bg-white/10"
            @click="handleLogout"
          >
            Выйти
          </button>
        </template>

        <template v-else>
          <button
            type="button"
            class="block w-full rounded-lg bg-white px-4 py-3 text-left text-sm font-semibold text-amber-900 transition-colors hover:bg-amber-100"
            @click="emit('login'); mobileMenuOpen = false"
          >
            Войти
          </button>
        </template>
      </div>
    </aside>
  </Transition>
</template>
