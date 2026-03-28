<script setup lang="ts">
import { computed } from 'vue'

import { useDishQuery } from '../composables/useCatalogQueries'
import ReviewList from '../components/dish/ReviewList.vue'
import LoadingSpinner from '../components/ui/LoadingSpinner.vue'
import ErrorMessage from '../components/ui/ErrorMessage.vue'

const props = defineProps<{ id: string }>()
const dishId = computed(() => Number(props.id))
const dishQuery = useDishQuery(dishId)
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 py-8">
    <RouterLink
      to="/"
      class="inline-flex items-center gap-2 text-amber-700 hover:text-amber-900 text-sm mb-6 transition-colors"
    >
      ← Вернуться в меню
    </RouterLink>

    <LoadingSpinner
      v-if="dishQuery.isLoading.value || dishQuery.isFetching.value"
      message="Загружаем блюдо..."
    />
    <ErrorMessage
      v-else-if="dishQuery.error.value"
      :message="dishQuery.error.value.message"
      :on-retry="dishQuery.refetch"
    />

    <template v-else-if="dishQuery.data.value">
      <div
        class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-8"
      >
        <div class="md:flex">
          <div class="aspect-4/3 overflow-hidden md:w-2/5 md:aspect-auto">
            <img
              :src="dishQuery.data.value.imageUrl"
              :alt="dishQuery.data.value.name"
              class="w-full h-full object-cover"
            />
          </div>
          <div class="md:w-3/5 p-6 md:p-8 flex flex-col">
            <div class="mb-2 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <span
                  class="text-xs font-medium text-amber-700 uppercase tracking-wide"
                >
                  {{ dishQuery.data.value.category }}
                </span>
                <h1 class="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">
                  {{ dishQuery.data.value.name }}
                </h1>
              </div>
              <div class="shrink-0 text-xl font-bold text-amber-700 sm:text-2xl">
                {{ dishQuery.data.value.price }} ₽
              </div>
            </div>
            <div class="flex flex-wrap gap-2 my-3">
              <span
                v-if="dishQuery.data.value.isSpicy"
                class="flex gap-2 bg-red-100 text-red-700 text-xs px-3 py-1 rounded-full font-medium"
              >
                <img
                  src="/icons/spice.svg"
                  alt="spice"
                  width="14"
                  height="14"
                />
                Острое
              </span>
              <span
                v-if="dishQuery.data.value.isChildFriendly"
                class="flex gap-2 bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-medium"
              >
                <img
                  src="/icons/child.svg"
                  alt="child"
                  width="14"
                  height="14"
                />
                Подходит детям
              </span>
            </div>
            <p class="text-gray-600 text-sm leading-relaxed mb-4">
              {{ dishQuery.data.value.description }}
            </p>
            <div class="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div class="bg-amber-50 rounded-lg p-3 text-center">
                <div class="text-lg font-bold text-amber-800">
                  {{ dishQuery.data.value.weight }} г
                </div>
                <div class="text-xs text-amber-600">Вес порции</div>
              </div>
              <div class="bg-amber-50 rounded-lg p-3 text-center">
                <div class="text-lg font-bold text-amber-800">
                  {{ dishQuery.data.value.calories }} ккал
                </div>
                <div class="text-xs text-amber-600">Калорийность</div>
              </div>
            </div>
            <div class="mb-4">
              <h3 class="text-sm font-semibold text-gray-700 mb-2">Состав</h3>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="ing in dishQuery.data.value.ingredients"
                  :key="ing"
                  class="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full"
                >
                  {{ ing }}
                </span>
              </div>
            </div>
            <div v-if="dishQuery.data.value.allergens.length">
              <h3 class="flex gap-2 text-sm font-semibold text-gray-700 mb-2">
                <img
                  src="/icons/caution.svg"
                  width="14"
                  height="14"
                  alt="caution"
                />
                Аллергены
              </h3>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="allergen in dishQuery.data.value.allergens"
                  :key="allergen"
                  class="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-full"
                >
                  {{ allergen }}
                </span>
              </div>
            </div>
            <div v-else class="flex gap-2 text-xs text-green-600 font-medium">
              <img src="/icons/check-black.svg" alt="check" width="14" height="14" />
              Нет аллергенов
            </div>
          </div>
        </div>
      </div>
      <ReviewList :dish-id="dishQuery.data.value.id" />
    </template>
  </div>
</template>
