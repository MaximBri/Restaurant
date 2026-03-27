<script setup lang="ts">
import { useReviewsQuery } from '../../composables/useCatalogQueries'
import LoadingSpinner from '../ui/LoadingSpinner.vue'
import ErrorMessage from '../ui/ErrorMessage.vue'

const props = defineProps<{ dishId: number }>()
const reviewsQuery = useReviewsQuery(() => props.dishId)
</script>

<template>
  <section>
    <h3 class="text-lg font-semibold text-gray-800 mb-4">Отзывы</h3>

    <LoadingSpinner
      v-if="reviewsQuery.isLoading.value || reviewsQuery.isFetching.value"
      message="Загружаем отзывы..."
    />
    <ErrorMessage
      v-else-if="reviewsQuery.error.value"
      :message="reviewsQuery.error.value.message"
    />

    <div v-else-if="reviewsQuery.data.value?.length" class="space-y-4">
      <div
        v-for="review in reviewsQuery.data.value"
        :key="review.id"
        class="bg-white rounded-xl border border-gray-100 p-4 flex gap-4"
      >
        <img
          :src="review.photoUrl"
          :alt="review.author"
          class="w-12 h-12 rounded-full object-cover shrink-0"
        />
        <div class="flex-1">
          <div class="flex items-center gap-2 mb-1">
            <span class="font-medium text-gray-800 text-sm">{{
              review.author
            }}</span>
            <div class="flex text-amber-400 text-xs">
              <span v-for="i in 5" :key="i">{{
                i <= review.rating ? '★' : '☆'
              }}</span>
            </div>
          </div>
          <p class="text-gray-600 text-sm">{{ review.text }}</p>
        </div>
      </div>
    </div>

    <div v-else class="text-gray-400 text-sm py-4 text-center">
      Отзывов пока нет. Будьте первым!
    </div>
  </section>
</template>
