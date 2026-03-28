<script setup lang="ts">
import { computed } from 'vue'

import {
  useAdminBookingsQuery,
  useDeleteBookingMutation,
} from '../composables/useCatalogQueries'
import LoadingSpinner from '../components/ui/LoadingSpinner.vue'
import ErrorMessage from '../components/ui/ErrorMessage.vue'

const adminBookingsQuery = useAdminBookingsQuery()
const deleteBookingMutation = useDeleteBookingMutation()
const bookings = computed(() => adminBookingsQuery.data.value ?? [])

const formatDate = (date: string) => {
  const [year, month, day] = date.split('-')
  return `${day}.${month}.${year}`
}

const handleDelete = async (bookingId: number) => {
  try {
    await deleteBookingMutation.mutateAsync(bookingId)
  } catch {}
}
</script>

<template>
  <div class="max-w-6xl mx-auto px-4 py-8">
    <div class="mb-6">
      <p
        class="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-amber-700"
      >
        Панель администратора
      </p>
      <h2 class="text-2xl font-bold text-gray-800">
        <span class="sm:hidden">Бронирования</span>
        <span class="hidden sm:inline">Бронирования пользователей</span>
      </h2>
      <p class="mt-1 text-sm text-gray-500">
        Всего записей: {{ bookings.length }}
      </p>
    </div>

    <LoadingSpinner
      v-if="
        adminBookingsQuery.isLoading.value ||
        adminBookingsQuery.isFetching.value
      "
      message="Загружаем бронирования..."
    />

    <ErrorMessage
      v-else-if="adminBookingsQuery.error.value"
      :message="adminBookingsQuery.error.value.message"
      :on-retry="adminBookingsQuery.refetch"
    />

    <div v-else-if="bookings.length" class="space-y-4">
      <ErrorMessage
        v-if="deleteBookingMutation.error.value"
        :message="deleteBookingMutation.error.value.message"
      />

      <article
        v-for="booking in bookings"
        :key="booking.id"
        class="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5"
      >
        <div
          class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between"
        >
          <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <p
                class="text-xs font-semibold uppercase tracking-wide text-gray-400"
              >
                Дата
              </p>
              <p class="mt-1 text-sm font-medium text-gray-800">
                {{ formatDate(booking.date) }}
              </p>
            </div>
            <div>
              <p
                class="text-xs font-semibold uppercase tracking-wide text-gray-400"
              >
                Зал и столик
              </p>
              <p class="mt-1 text-sm font-medium text-gray-800">
                {{ booking.hallName }}, стол №{{ booking.tableNumber }}
              </p>
            </div>
            <div>
              <p
                class="text-xs font-semibold uppercase tracking-wide text-gray-400"
              >
                Гостей
              </p>
              <p class="mt-1 text-sm font-medium text-gray-800">
                {{ booking.guestsCount }}
              </p>
            </div>
            <div>
              <p
                class="text-xs font-semibold uppercase tracking-wide text-gray-400"
              >
                Имя гостя
              </p>
              <p class="mt-1 text-sm font-medium text-gray-800">
                {{ booking.guestName }}
              </p>
            </div>
            <div>
              <p
                class="text-xs font-semibold uppercase tracking-wide text-gray-400"
              >
                Телефон
              </p>
              <p class="mt-1 text-sm font-medium text-gray-800">
                {{ booking.phone }}
              </p>
            </div>
            <div>
              <p
                class="text-xs font-semibold uppercase tracking-wide text-gray-400"
              >
                Создатель
              </p>
              <p class="mt-1 text-sm font-medium text-gray-800">
                {{ booking.creatorName || 'Старая запись' }}
              </p>
              <p v-if="booking.creatorEmail" class="text-xs text-gray-500">
                {{ booking.creatorEmail }}
              </p>
            </div>
          </div>

          <button
            type="button"
            class="w-full rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50 md:w-auto"
            :disabled="deleteBookingMutation.isPending.value"
            @click="handleDelete(booking.id)"
          >
            Удалить
          </button>
        </div>
      </article>
    </div>

    <div
      v-else
      class="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-16 text-center text-sm text-gray-500"
    >
      Бронирований пока нет.
    </div>
  </div>
</template>
