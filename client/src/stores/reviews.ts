import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Review } from '../types'
import { fetchReviewsByDish } from '../api'

export const useReviewsStore = defineStore('reviews', () => {
  const reviews = ref<Review[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const loadReviews = async (dishId: number) => {
    loading.value = true
    error.value = null
    reviews.value = []
    try {
      reviews.value = await fetchReviewsByDish(dishId)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Ошибка загрузки отзывов'
    } finally {
      loading.value = false
    }
  }

  return { reviews, loading, error, loadReviews }
})
