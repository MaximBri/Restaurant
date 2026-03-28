<script setup lang="ts">
import { ref } from 'vue'

import { useDishesStore } from '../../stores/dishes'

const { allAllergens, filters, resetFilters, allCategories } = useDishesStore()
const mobileFiltersOpen = ref(false)

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
    class="space-y-5 rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5 lg:sticky lg:top-4"
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
    <button
      type="button"
      class="flex w-full items-center justify-between rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 lg:hidden"
      :aria-expanded="mobileFiltersOpen"
      @click="mobileFiltersOpen = !mobileFiltersOpen"
    >
      <span>{{ mobileFiltersOpen ? 'Скрыть фильтры' : 'Показать фильтры' }}</span>
      <span class="text-lg leading-none text-amber-700">
        {{ mobileFiltersOpen ? '−' : '+' }}
      </span>
    </button>

    <div class="hidden space-y-5 lg:block">
      <div>
        <label class="mb-1 block text-xs font-medium text-gray-600">Поиск</label>
        <input
          v-model="filters.search"
          type="text"
          placeholder="Название блюда..."
          class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
      </div>
      <div>
        <label class="mb-1 block text-xs font-medium text-gray-600"
          >Раздел меню</label
        >
        <select
          v-model="filters.category"
          class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
        >
          <option value="">Все разделы</option>
          <option v-for="cat in allCategories" :key="cat" :value="cat">
            {{ cat }}
          </option>
        </select>
      </div>
      <div>
        <label class="mb-1 block text-xs font-medium text-gray-600">
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
        <div class="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-500">
          <span>От {{ filters.minCalories }} ккал</span>
          <span class="text-right">До {{ filters.maxCalories }} ккал</span>
        </div>
      </div>
      <div>
        <label class="mb-1 block text-xs font-medium text-gray-600">
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
        <div class="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-500">
          <span>От {{ filters.minWeight }} г</span>
          <span class="text-right">До {{ filters.maxWeight }} г</span>
        </div>
      </div>
      <div>
        <label class="mb-2 block text-xs font-medium text-gray-600"
          >Доп. признаки</label
        >
        <div class="space-y-2">
          <label
            class="flex cursor-pointer items-center gap-2 text-sm text-gray-700"
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
            class="flex cursor-pointer items-center gap-2 text-sm text-gray-700"
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
        <label class="mb-2 block text-xs font-medium text-gray-600"
          >Исключить аллергены</label
        >
        <div class="flex flex-wrap gap-2">
          <button
            v-for="allergen in allAllergens"
            :key="allergen"
            @click="toggleAllergen(allergen)"
            class="rounded-full border px-2 py-1 text-xs transition-colors"
            :class="
              filters.excludeAllergens.includes(allergen)
                ? 'border-red-400 bg-red-100 text-red-700'
                : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-red-300'
            "
          >
            {{ allergen }}
          </button>
        </div>
      </div>
    </div>

    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      enter-from-class="max-h-0 opacity-0"
      enter-to-class="max-h-[1200px] opacity-100"
      leave-active-class="transition-all duration-200 ease-in"
      leave-from-class="max-h-[1200px] opacity-100"
      leave-to-class="max-h-0 opacity-0"
    >
      <div v-if="mobileFiltersOpen" class="space-y-5 overflow-hidden lg:hidden">
        <div>
          <label class="mb-1 block text-xs font-medium text-gray-600">Поиск</label>
          <input
            v-model="filters.search"
            type="text"
            placeholder="Название блюда..."
            class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>
        <div>
          <label class="mb-1 block text-xs font-medium text-gray-600"
            >Раздел меню</label
          >
          <select
            v-model="filters.category"
            class="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
          >
            <option value="">Все разделы</option>
            <option v-for="cat in allCategories" :key="cat" :value="cat">
              {{ cat }}
            </option>
          </select>
        </div>
        <div>
          <label class="mb-1 block text-xs font-medium text-gray-600">
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
          <div class="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-500">
            <span>От {{ filters.minCalories }} ккал</span>
            <span class="text-right">До {{ filters.maxCalories }} ккал</span>
          </div>
        </div>
        <div>
          <label class="mb-1 block text-xs font-medium text-gray-600">
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
          <div class="mt-2 grid grid-cols-2 gap-2 text-xs text-gray-500">
            <span>От {{ filters.minWeight }} г</span>
            <span class="text-right">До {{ filters.maxWeight }} г</span>
          </div>
        </div>
        <div>
          <label class="mb-2 block text-xs font-medium text-gray-600"
            >Доп. признаки</label
          >
          <div class="space-y-2">
            <label
              class="flex cursor-pointer items-center gap-2 text-sm text-gray-700"
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
              class="flex cursor-pointer items-center gap-2 text-sm text-gray-700"
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
          <label class="mb-2 block text-xs font-medium text-gray-600"
            >Исключить аллергены</label
          >
          <div class="flex flex-wrap gap-2">
            <button
              v-for="allergen in allAllergens"
              :key="allergen"
              @click="toggleAllergen(allergen)"
              class="rounded-full border px-2 py-1 text-xs transition-colors"
              :class="
                filters.excludeAllergens.includes(allergen)
                  ? 'border-red-400 bg-red-100 text-red-700'
                  : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-red-300'
              "
            >
              {{ allergen }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </aside>
</template>
