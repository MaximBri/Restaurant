<script setup lang="ts">
import { useDishesStore } from '../../stores/dishes'

const { allAllergens, filters, resetFilters, allCategories } = useDishesStore()

const enum SortTypes {
  IsSpicy = 'isSpicy',
  IsChildFriendly = 'isChildFriendly',
}

const toggleBool = (key: SortTypes) => {
  filters[key] = filters[key] === true ? null : true
}

const toggleAllergen = (allergen: string) => {
  const idx = filters.excludeAllergens.indexOf(allergen)
  if (idx >= 0) {
    filters.excludeAllergens.splice(idx, 1)
  } else {
    filters.excludeAllergens.push(allergen)
  }
}
</script>

<template>
  <aside
    class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-5 sticky top-4"
  >
    <div class="flex items-center justify-between">
      <h2 class="font-semibold text-gray-700 text-sm uppercase tracking-wide">
        Фильтры
      </h2>
      <button
        @click="resetFilters()"
        class="text-xs text-amber-700 hover:underline"
      >
        Сбросить
      </button>
    </div>
    <div>
      <label class="block text-xs font-medium text-gray-600 mb-1">Поиск</label>
      <input
        v-model="filters.search"
        type="text"
        placeholder="Название блюда..."
        class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
      />
    </div>
    <div>
      <label class="block text-xs font-medium text-gray-600 mb-1"
        >Раздел меню</label
      >
      <select
        v-model="filters.category"
        class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
      >
        <option value="">Все разделы</option>
        <option v-for="cat in allCategories" :key="cat" :value="cat">
          {{ cat }}
        </option>
      </select>
    </div>
    <div>
      <label class="block text-xs font-medium text-gray-600 mb-1">
        Калории: {{ filters.minCalories }} – {{ filters.maxCalories }} ккал
      </label>
      <div class="space-y-1">
        <input
          v-model.number="filters.minCalories"
          type="range"
          min="0"
          max="2000"
          step="50"
          class="w-full accent-amber-600"
        />
        <input
          v-model.number="filters.maxCalories"
          type="range"
          min="0"
          max="2000"
          step="50"
          class="w-full accent-amber-600"
        />
      </div>
    </div>
    <div>
      <label class="block text-xs font-medium text-gray-600 mb-1">
        Вес: {{ filters.minWeight }} – {{ filters.maxWeight }} г
      </label>
      <div class="space-y-1">
        <input
          v-model.number="filters.minWeight"
          type="range"
          min="0"
          max="2000"
          step="50"
          class="w-full accent-amber-600"
        />
        <input
          v-model.number="filters.maxWeight"
          type="range"
          min="0"
          max="2000"
          step="50"
          class="w-full accent-amber-600"
        />
      </div>
    </div>
    <div>
      <label class="block text-xs font-medium text-gray-600 mb-2"
        >Доп. признаки</label
      >
      <div class="space-y-2">
        <label
          class="flex items-center gap-2 text-sm text-gray-700 cursor-pointer"
        >
          <input
            type="checkbox"
            :checked="filters.isSpicy === true"
            @change="toggleBool(SortTypes.IsSpicy)"
            class="accent-amber-600"
          />
          <img src="/icons/spice.svg" alt="spice" width="14" height="14" />
          Только острые
        </label>
        <label
          class="flex items-center gap-2 text-sm text-gray-700 cursor-pointer"
        >
          <input
            type="checkbox"
            :checked="filters.isChildFriendly === true"
            @change="toggleBool(SortTypes.IsChildFriendly)"
            class="accent-amber-600"
          />
          <img src="/icons/child.svg" alt="child" width="14" height="14" />
          Подходит детям
        </label>
      </div>
    </div>
    <div>
      <label class="block text-xs font-medium text-gray-600 mb-2"
        >Исключить аллергены</label
      >
      <div class="flex flex-wrap gap-2">
        <button
          v-for="allergen in allAllergens"
          :key="allergen"
          @click="toggleAllergen(allergen)"
          class="px-2 py-1 rounded-full text-xs border transition-colors"
          :class="
            filters.excludeAllergens.includes(allergen)
              ? 'bg-red-100 border-red-400 text-red-700'
              : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-red-300'
          "
        >
          {{ allergen }}
        </button>
      </div>
    </div>
  </aside>
</template>
