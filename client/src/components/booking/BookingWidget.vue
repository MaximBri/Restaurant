<script setup lang="ts">
import { ref } from 'vue'
import { useBookingStore } from '../../stores/booking'
import HallSelector from './HallSelector.vue'
import HallMap from './HallMap.vue'
import BookingForm from './BookingForm.vue'

const store = useBookingStore()

const step = ref(1)
const hallId = ref<number | null>(null)
const tableId = ref<number | null>(null)
const date = ref('')

const steps = ['Зал и дата', 'Столик', 'Контакты']

const onHallSelected = (selectedHallId: number, selectedDate: string) => {
  hallId.value = selectedHallId
  date.value = selectedDate
  step.value = 2
}

const onTableSelected = (selectedTableId: number) => {
  tableId.value = selectedTableId
  step.value = 3
}

const reset = () => {
  step.value = 1
  hallId.value = null
  tableId.value = null
  date.value = ''
  store.reset()
}
</script>

<template>
  <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
    <div class="mb-8 flex flex-wrap items-center gap-3 sm:gap-2">
      <div
        v-for="(label, i) in steps"
        :key="i"
        class="flex items-center gap-2"
      >
        <div
          class="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold transition-colors"
          :class="
            i + 1 < step
              ? 'bg-green-500 text-white'
              : i + 1 === step
                ? 'bg-amber-700 text-white'
                : 'bg-gray-100 text-gray-400'
          "
        >
          <img
            v-if="i + 1 < step"
            src="/icons/check.svg"
            width="14"
            height="14"
            alt="check"
          />
          <template v-else>
            {{ i + 1 }}
          </template>
        </div>
        <span
          class="text-sm"
          :class="
            i + 1 === step ? 'text-gray-800 font-medium' : 'text-gray-400'
          "
          >{{ label }}</span
        >
        <span v-if="i < steps.length - 1" class="mx-1 hidden text-gray-300 sm:inline">›</span>
      </div>
    </div>
    <HallSelector v-if="step === 1" @next="onHallSelected" />
    <HallMap
      v-else-if="step === 2"
      :hall-id="hallId!"
      :date="date"
      @next="onTableSelected"
      @back="step = 1"
    />
    <BookingForm
      v-else-if="step === 3"
      :hall-id="hallId!"
      :table-id="tableId!"
      :date="date"
      @back="step = 2"
      @done="step = 4"
    />
    <div v-else class="text-center py-8 space-y-4">
      <h3 class="text-xl font-bold text-gray-800">Столик забронирован!</h3>
      <p class="text-gray-500 text-sm">
        Ждём вас. Наш администратор свяжется с вами для подтверждения.
      </p>
      <button
        @click="reset"
        class="mt-4 px-6 py-2.5 bg-amber-700 text-white rounded-lg text-sm font-medium hover:bg-amber-800 transition-colors"
      >
        Новое бронирование
      </button>
    </div>
  </div>
</template>
