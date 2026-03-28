<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'

import { useDishesQuery } from '../composables/useCatalogQueries'
import { useDebouncedValue } from '../composables/useDebouncedValue'
import { useDishesStore } from '../stores/dishes'
import DishFilters from '../components/menu/DishFilters.vue'
import DishCard from '../components/menu/DishCard.vue'
import LoadingSpinner from '../components/ui/LoadingSpinner.vue'
import ErrorMessage from '../components/ui/ErrorMessage.vue'

const store = useDishesStore()
const { filters } = storeToRefs(store)
const debouncedFilters = useDebouncedValue(filters, 350)
const dishesQuery = useDishesQuery(debouncedFilters)
const dishes = computed(() => dishesQuery.data.value ?? [])
const isInitialLoading = computed(
  () => dishesQuery.isLoading.value && !dishesQuery.data.value,
)
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 py-8">
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-800 sm:text-3xl">Наше меню</h2>
      <p class="mt-1 flex flex-wrap items-center gap-2 text-sm text-gray-500">
        Найдено блюд: {{ dishes.length }}
        <span
          v-if="dishesQuery.isFetching.value && dishesQuery.data.value"
          class="text-xs text-amber-700"
        >
          Обновляем...
        </span>
      </p>
    </div>
    <LoadingSpinner v-if="isInitialLoading" message="Загружаем меню..." />
    <ErrorMessage
      v-else-if="dishesQuery.error.value"
      :message="dishesQuery.error.value.message"
      :on-retry="dishesQuery.refetch"
    />
    <div v-else class="flex flex-col gap-6 lg:flex-row">
      <div class="w-full shrink-0 lg:w-64">
        <DishFilters />
      </div>

      <div class="flex-1">
        <div
          v-if="dishes.length"
          class="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3"
        >
          <DishCard
            v-for="dish in dishes"
            :key="dish.id"
            :dish="dish"
          />
        </div>
        <div
          v-else
          class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white px-4 py-16 text-center text-gray-400 sm:py-20"
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
