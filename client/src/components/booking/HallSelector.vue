<script setup lang="ts">
import { ref } from 'vue'

import { useHallsQuery } from '../../composables/useCatalogQueries'
import LoadingSpinner from '../ui/LoadingSpinner.vue'
import ErrorMessage from '../ui/ErrorMessage.vue'

const emit = defineEmits<{
  next: [hallId: number, date: string]
}>()

const selectedHallId = ref<number | null>(null)
const selectedDate = ref('')
const today = new Date().toISOString().split('T')[0]
const hallsQuery = useHallsQuery()

const next = () => {
  if (selectedHallId.value && selectedDate.value) {
    emit('next', selectedHallId.value, selectedDate.value)
  }
}
</script>

<template>
  <div class="space-y-5">
    <h3 class="text-lg font-semibold text-gray-800">
      Шаг 1: Выберите зал и дату
    </h3>
    <LoadingSpinner
      v-if="hallsQuery.isLoading.value || hallsQuery.isFetching.value"
      message="Загружаем залы..."
    />
    <ErrorMessage
      v-else-if="hallsQuery.error.value"
      :message="hallsQuery.error.value.message"
      :on-retry="hallsQuery.refetch"
    />
    <template v-else>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1"
          >Дата посещения</label
        >
        <input
          v-model="selectedDate"
          type="date"
          :min="today"
          class="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 w-full max-w-xs"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Зал</label>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            v-for="hall in hallsQuery.data.value"
            :key="hall.id"
            @click="selectedHallId = hall.id"
            class="rounded-xl overflow-hidden border-2 text-left transition-all"
            :class="
              selectedHallId === hall.id
                ? 'border-amber-600 shadow-md'
                : 'border-gray-200 hover:border-amber-300'
            "
          >
            <img
              :src="hall.imageUrl"
              :alt="hall.name"
              class="w-full h-28 object-cover"
            />
            <div class="p-3">
              <p class="font-semibold text-sm text-gray-800">{{ hall.name }}</p>
              <p class="text-xs text-gray-500 mt-0.5">{{ hall.description }}</p>
            </div>
          </button>
        </div>
      </div>
      <button
        :disabled="!selectedHallId || !selectedDate"
        @click="next"
        class="flex gap-2 px-6 py-2.5 bg-amber-700 text-white rounded-lg text-sm font-medium hover:bg-amber-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Далее — выбрать столик
        <img
          class="rotate-180"
          src="/icons/back-white.svg"
          alt="forward"
          width="14"
          height="14"
        />
      </button>
    </template>
  </div>
</template>
