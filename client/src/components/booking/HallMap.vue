<script setup lang="ts">
import { ref, computed } from 'vue'

import { useBookingsQuery, useTablesQuery } from '../../composables/useCatalogQueries'
import type { Table } from '../../types'
import LoadingSpinner from '../ui/LoadingSpinner.vue'
import ErrorMessage from '../ui/ErrorMessage.vue'

const props = defineProps<{ hallId: number; date: string }>()
const emit = defineEmits<{
  next: [tableId: number]
  back: []
}>()

const selectedTableId = ref<number | null>(null)
const tablesQuery = useTablesQuery(() => props.hallId)
const bookingsQuery = useBookingsQuery(() => props.hallId, () => props.date)
const tables = computed(() => tablesQuery.data.value ?? [])
const bookings = computed(() => bookingsQuery.data.value ?? [])
const selectedTable = computed(() =>
  tables.value.find((t) => t.id === selectedTableId.value),
)
const loading = computed(
  () =>
    tablesQuery.isLoading.value ||
    tablesQuery.isFetching.value ||
    bookingsQuery.isLoading.value ||
    bookingsQuery.isFetching.value,
)
const errorMessage = computed(
  () => tablesQuery.error.value?.message || bookingsQuery.error.value?.message || null,
)
const isTableBooked = (tableId: number) =>
  bookings.value.some((booking) => booking.tableId === tableId)

function tableClass(tableId: number) {
  if (isTableBooked(tableId)) {
    return 'bg-red-100 border-red-400 text-red-600 cursor-not-allowed opacity-60'
  }
  if (selectedTableId.value === tableId) {
    return 'bg-amber-400 border-amber-600 text-amber-900 scale-110 shadow-md'
  }
  return 'bg-green-100 border-green-400 text-green-800 hover:scale-105 hover:shadow cursor-pointer'
}

const seatIcon = (seats: number): string => {
  if (seats <= 2) return '/icons/chair.svg'
  if (seats <= 4) return '/icons/dishes.svg'
  return '/icons/gift.svg'
}

const tableLabel = (table: Table): string => {
  const booked = isTableBooked(table.id)
  return `Столик №${table.number} · ${table.seats} персоны · ${booked ? 'Занят' : 'Свободен'}`
}

const select = (tableId: number) => {
  if (!isTableBooked(tableId)) {
    selectedTableId.value = tableId
  }
}

const next = () => {
  if (selectedTableId.value) emit('next', selectedTableId.value)
}
</script>

<template>
  <div class="space-y-4">
    <h3 class="text-lg font-semibold text-gray-800">Шаг 2: Выберите столик</h3>
    <LoadingSpinner v-if="loading" message="Загружаем карту зала..." />
    <ErrorMessage
      v-else-if="errorMessage"
      :message="errorMessage"
      :on-retry="() => { void tablesQuery.refetch(); void bookingsQuery.refetch() }"
    />
    <template v-else>
      <div class="flex flex-wrap gap-3 text-xs text-gray-600">
        <div class="flex items-center gap-1.5">
          <div
            class="w-5 h-5 rounded bg-green-100 border-2 border-green-400"
          ></div>
          Свободен
        </div>
        <div class="flex items-center gap-1.5">
          <div class="w-5 h-5 rounded bg-red-100 border-2 border-red-400"></div>
          Занят
        </div>
        <div class="flex items-center gap-1.5">
          <div
            class="w-5 h-5 rounded bg-amber-400 border-2 border-amber-600"
          ></div>
          Выбран
        </div>
      </div>
      <div
        class="relative overflow-hidden rounded-xl border-2 border-amber-200 bg-amber-50"
        style="height: 300px"
      >
        <div class="absolute inset-0 opacity-10">
          <div
            class="absolute top-4 left-4 right-4 bottom-4 border-2 border-dashed border-amber-400 rounded-lg"
          ></div>
        </div>

        <div
          class="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-2 rounded-full border border-amber-300 bg-amber-100 px-3 py-1 text-[10px] font-medium text-amber-700 sm:text-xs"
        >
          <img src="/icons/door.svg" alt="door" width="14" height="14" />
          Вход
        </div>
        <button
          v-for="table in tables"
          :key="table.id"
          :disabled="isTableBooked(table.id)"
          @click="select(table.id)"
          :style="{
            left: table.x + '%',
            top: table.y + '%',
          }"
          :title="tableLabel(table)"
          class="absolute flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 transform flex-col items-center justify-center rounded-xl border-2 text-[10px] font-semibold transition-all sm:h-14 sm:w-14 sm:text-xs"
          :class="tableClass(table.id)"
        >
          <span class="text-sm sm:text-base">
            <img
              :src="seatIcon(table.seats)"
              alt="icon"
              width="16"
              height="16"
            />
          </span>
          <span>№{{ table.number }}</span>
          <span class="text-[10px] opacity-70">{{ table.seats }}ос.</span>
        </button>
      </div>

      <div
        v-if="selectedTableId"
        class="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800"
      >
        <img src="/icons/check-black.svg" width="14" height="14" alt="check" />
        Выбран столик №{{ selectedTable?.number }} на
        {{ selectedTable?.seats }} персоны
      </div>

      <div class="flex flex-col gap-3 sm:flex-row">
        <button
          @click="emit('back')"
          class="flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-50"
        >
          <img src="/icons/back.svg" width="14" height="14" alt="back" />
          Назад
        </button>
        <button
          :disabled="!selectedTableId"
          @click="next"
          class="flex items-center justify-center gap-2 rounded-lg bg-amber-700 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Далее — ввести данные
          <img
            src="/icons/back-white.svg"
            class="rotate-180"
            width="14"
            height="14"
            alt="forward"
          />
        </button>
      </div>
    </template>
  </div>
</template>
