<script setup lang="ts">
import { onMounted } from 'vue'
import { useDishesStore } from '../stores/dishes'
import DishFilters from '../components/menu/DishFilters.vue'
import DishCard from '../components/menu/DishCard.vue'
import LoadingSpinner from '../components/ui/LoadingSpinner.vue'
import ErrorMessage from '../components/ui/ErrorMessage.vue'

const store = useDishesStore()

onMounted(() => {
  if (!store.dishes.length) store.loadDishes()
})
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 py-8">
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-800">Наше меню</h2>
      <p class="text-gray-500 text-sm mt-1">
        {{ store.filteredDishes.length }} из {{ store.dishes.length }} блюд
      </p>
    </div>
    <LoadingSpinner v-if="store.loading" message="Загружаем меню..." />
    <ErrorMessage
      v-else-if="store.error"
      :message="store.error"
      :on-retry="store.loadDishes"
    />
    <div v-else class="flex gap-6">
      <div class="w-64 shrink-0">
        <DishFilters />
      </div>

      <div class="flex-1">
        <div
          v-if="store.filteredDishes.length"
          class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5"
        >
          <DishCard
            v-for="dish in store.filteredDishes"
            :key="dish.id"
            :dish="dish"
          />
        </div>
        <div
          v-else
          class="flex flex-col items-center justify-center py-20 text-gray-400"
        >
          <span class="text-5xl mb-4">
            <img src="/icons/dishes.svg" alt="Dishes" width="50" height="50">
          </span>
          <p class="text-lg font-medium">Блюда не найдены</p>
          <p class="text-sm mt-1">Попробуйте изменить параметры фильтрации</p>
          <button
            @click="store.resetFilters()"
            class="mt-4 px-4 py-2 bg-amber-700 text-white rounded-lg text-sm hover:bg-amber-800 transition-colors"
          >
            Сбросить фильтры
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
