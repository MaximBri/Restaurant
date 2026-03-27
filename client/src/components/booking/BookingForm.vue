<script setup lang="ts">
import { reactive, computed } from 'vue'
import { useBookingStore } from '../../stores/booking'
import ErrorMessage from '../ui/ErrorMessage.vue'

const props = defineProps<{
  hallId: number
  tableId: number
  date: string
}>()

const emit = defineEmits<{
  back: []
  done: []
}>()

const store = useBookingStore()

const table = computed(() => store.tables.find((t) => t.id === props.tableId))
const hallName = computed(
  () => store.halls.find((h) => h.id === props.hallId)?.name ?? '',
)
const formattedDate = computed(() => {
  const [y, m, d] = props.date.split('-')
  return `${d}.${m}.${y}`
})

const form = reactive({
  guestName: '',
  phone: '',
  guestsCount: 1,
})

const submit = async () => {
  await store.book({
    tableId: props.tableId,
    hallId: props.hallId,
    date: props.date,
    guestName: form.guestName,
    phone: form.phone,
    guestsCount: form.guestsCount,
  })
  if (store.success) emit('done')
}
</script>

<template>
  <div class="space-y-5">
    <h3 class="text-lg font-semibold text-gray-800">Шаг 3: Ваши данные</h3>
    <div
      class="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm space-y-1"
    >
      <p>
        <span class="text-gray-500">Зал:</span> <strong>{{ hallName }}</strong>
      </p>
      <p>
        <span class="text-gray-500">Дата:</span>
        <strong>{{ formattedDate }}</strong>
      </p>
      <p>
        <span class="text-gray-500">Столик:</span>
        <strong>№{{ table?.number }} ({{ table?.seats }} персоны)</strong>
      </p>
    </div>
    <form @submit.prevent="submit" class="space-y-4 max-w-sm">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1"
          >Ваше имя</label
        >
        <input
          v-model="form.guestName"
          type="text"
          required
          placeholder="Иван Иванов"
          class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1"
          >Телефон</label
        >
        <input
          v-model="form.phone"
          type="tel"
          required
          placeholder="+7 900 000-00-00"
          class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Количество гостей (макс. {{ table?.seats }})
        </label>
        <input
          v-model.number="form.guestsCount"
          type="number"
          required
          :min="1"
          :max="table?.seats"
          class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
      </div>
      <ErrorMessage v-if="store.error" :message="store.error" />
      <div class="flex gap-3 pt-1">
        <button
          type="button"
          @click="emit('back')"
          class="flex gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors"
        >
          <img src="/icons/back.svg" width="14" height="14" alt="back" />
          Назад
        </button>
        <button
          type="submit"
          :disabled="store.loading"
          class="px-6 py-2.5 bg-amber-700 text-white rounded-lg text-sm font-medium hover:bg-amber-800 transition-colors disabled:opacity-40"
        >
          {{ store.loading ? 'Бронируем...' : 'Забронировать' }}
        </button>
      </div>
    </form>
  </div>
</template>
