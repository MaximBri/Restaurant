import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { DishFilters } from '../types'

const ALL_ALLERGENS = [
  'глютен',
  'яйца',
  'молоко',
  'ракообразные',
  'рыба',
  'орехи',
  'соя',
]
const ALL_CATEGORIES = [
  'Супы',
  'Салаты',
  'Горячее',
  'Десерты',
  'Пицца',
  'Напитки',
]

export const useDishesStore = defineStore('dishes', () => {
  const filters = ref<DishFilters>({
    search: '',
    category: '',
    minCalories: 0,
    maxCalories: 2000,
    minWeight: 0,
    maxWeight: 2000,
    isSpicy: null,
    isChildFriendly: null,
    excludeAllergens: [],
  })

  const resetFilters = () => {
    Object.assign(filters.value, {
      search: '',
      category: '',
      minCalories: 0,
      maxCalories: 2000,
      minWeight: 0,
      maxWeight: 2000,
      isSpicy: null,
      isChildFriendly: null,
      excludeAllergens: [],
    })
  }

  return {
    filters,
    resetFilters,
    allCategories: ALL_CATEGORIES,
    allAllergens: ALL_ALLERGENS,
  }
})
