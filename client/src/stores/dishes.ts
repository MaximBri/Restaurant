import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Dish, DishFilters } from '../types'
import { fetchDishes, fetchDishById } from '../api'

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
  const dishes = ref<Dish[]>([])
  const currentDish = ref<Dish | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

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

  const filteredDishes = computed(() => {
    const f = filters.value
    return dishes.value.filter((dish) => {
      if (f.search && !dish.name.toLowerCase().includes(f.search.toLowerCase()))
        return false
      if (f.category && dish.category !== f.category) return false
      if (dish.calories < f.minCalories || dish.calories > f.maxCalories)
        return false
      if (dish.weight < f.minWeight || dish.weight > f.maxWeight) return false
      if (f.isSpicy !== null && dish.isSpicy !== f.isSpicy) return false
      if (
        f.isChildFriendly !== null &&
        dish.isChildFriendly !== f.isChildFriendly
      )
        return false
      if (f.excludeAllergens.length > 0) {
        const hasAllergen = f.excludeAllergens.some((a) =>
          dish.allergens.includes(a),
        )
        if (hasAllergen) return false
      }
      return true
    })
  })

  const loadDishes = async () => {
    loading.value = true
    error.value = null
    try {
      dishes.value = await fetchDishes()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Ошибка загрузки меню'
    } finally {
      loading.value = false
    }
  }

  const loadDish = async (id: number) => {
    loading.value = true
    error.value = null
    currentDish.value = null
    try {
      currentDish.value = await fetchDishById(id)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Блюдо не найдено'
    } finally {
      loading.value = false
    }
  }

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
    dishes,
    currentDish,
    loading,
    error,
    filters,
    filteredDishes,
    loadDishes,
    loadDish,
    resetFilters,
    allCategories: ALL_CATEGORIES,
    allAllergens: ALL_ALLERGENS,
  }
})
