<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useBookingStore } from '../../stores/booking'
import type { Table } from '../../types'
import LoadingSpinner from '../ui/LoadingSpinner.vue'
import ErrorMessage from '../ui/ErrorMessage.vue'

const props = defineProps<{ hallId: number; date: string }>()
const emit = defineEmits<{
  next: [tableId: number]
  back: []
}>()

const store = useBookingStore()
const selectedTableId = ref<number | null>(null)
const selectedTable = computed(() =>
  store.tables.find((t) => t.id === selectedTableId.value),
)

onMounted(() => store.loadTablesAndBookings(props.hallId, props.date))

function tableClass(tableId: number) {
  if (store.isTableBooked(tableId)) {
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
  const booked = store.isTableBooked(table.id)
  return `Столик №${table.number} · ${table.seats} персоны · ${booked ? 'Занят' : 'Свободен'}`
}

const select = (tableId: number) => {
  if (!store.isTableBooked(tableId)) {
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
    <LoadingSpinner v-if="store.loading" message="Загружаем карту зала..." />
    <ErrorMessage v-else-if="store.error" :message="store.error" />
    <template v-else>
      <div class="flex flex-wrap gap-4 text-xs text-gray-600">
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
        class="relative bg-amber-50 border-2 border-amber-200 rounded-xl overflow-hidden"
        style="height: 340px"
      >
        <div class="absolute inset-0 opacity-10">
          <div
            class="absolute top-4 left-4 right-4 bottom-4 border-2 border-dashed border-amber-400 rounded-lg"
          ></div>
        </div>

        <div
          class="flex gap-2 absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-amber-700 font-medium bg-amber-100 px-3 py-1 rounded-full border border-amber-300"
        >
          <img src="/icons/door.svg" alt="door" width="14" height="14" />
          Вход
        </div>
        <button
          v-for="table in store.tables"
          :key="table.id"
          :disabled="store.isTableBooked(table.id)"
          @click="select(table.id)"
          :style="{
            left: table.x + '%',
            top: table.y + '%',
          }"
          :title="tableLabel(table)"
          class="absolute transform -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-xl border-2 flex flex-col items-center justify-center text-xs font-semibold transition-all"
          :class="tableClass(table.id)"
        >
          <span class="text-base">
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
        class="flex gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800"
      >
        <img src="/icons/check-black.svg" width="14" height="14" alt="check" />
        Выбран столик №{{ selectedTable?.number }} на
        {{ selectedTable?.seats }} персоны
      </div>

      <div class="flex gap-3">
        <button
          @click="emit('back')"
          class="flex gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors"
        >
          <img src="/icons/back.svg" width="14" height="14" alt="back" />
          Назад
        </button>
        <button
          :disabled="!selectedTableId"
          @click="next"
          class="flex gap-2 px-6 py-2.5 bg-amber-700 text-white rounded-lg text-sm font-medium hover:bg-amber-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
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
