<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
  <header class="bg-amber-900 text-white shadow-lg">
    <div class="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
      <RouterLink
        to="/"
        class="flex items-center gap-3 hover:opacity-90 transition-opacity"
      >
        <img src="/icons/dishes.svg" width="14" height="14" alt="logo" class="text-2xl" />
        <div>
          <h1 class="text-xl font-bold leading-tight">Русский ресторан</h1>
        </div>
      </RouterLink>

      <nav class="flex items-center gap-2">
        <RouterLink
          to="/"
          class="px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-amber-800"
          :class="{ 'bg-amber-800': route.name === 'menu' }"
        >
          Меню
        </RouterLink>
        <RouterLink
          to="/booking"
          class="px-4 py-2 rounded-lg text-sm font-medium bg-amber-600 hover:bg-amber-500 transition-colors"
        >
          Забронировать столик
        </RouterLink>
      </nav>
    </div>
  </header>
</template>
