<script setup lang="ts">
import { computed, reactive } from 'vue'

import { useCreateBookingMutation, useHallsQuery, useTablesQuery } from '../../composables/useCatalogQueries'
import AppTextField from '../ui/AppTextField.vue'
import ErrorMessage from '../ui/ErrorMessage.vue'
import { normalizePhone, validateName, validatePhone } from '../../utils/validation'

const props = defineProps<{
  hallId: number
  tableId: number
  date: string
}>()

const emit = defineEmits<{
  back: []
  done: []
}>()

const createBookingMutation = useCreateBookingMutation()
const hallsQuery = useHallsQuery()
const tablesQuery = useTablesQuery(() => props.hallId)

const table = computed(() => tablesQuery.data.value?.find((t) => t.id === props.tableId))
const hallName = computed(() => hallsQuery.data.value?.find((h) => h.id === props.hallId)?.name ?? '')
const formattedDate = computed(() => {
  const [y, m, d] = props.date.split('-')
  return `${d}.${m}.${y}`
})

const form = reactive({
  guestName: '',
  phone: '',
  guestsCount: 1,
})

const touched = reactive({
  guestName: false,
  phone: false,
})

const fieldErrors = computed(() => ({
  guestName: validateName(form.guestName, 'Ваше имя'),
  phone: validatePhone(form.phone),
}))

function getVisibleError(field: 'guestName' | 'phone') {
  return touched[field] ? fieldErrors.value[field] : null
}

function touchField(field: 'guestName' | 'phone') {
  touched[field] = true
}

const submit = async () => {
  touched.guestName = true
  touched.phone = true

  if (fieldErrors.value.guestName || fieldErrors.value.phone) {
    return
  }

  try {
    await createBookingMutation.mutateAsync({
      tableId: props.tableId,
      hallId: props.hallId,
      date: props.date,
      guestName: form.guestName.trim(),
      phone: normalizePhone(form.phone),
      guestsCount: form.guestsCount,
    })
    emit('done')
  } catch {
    // Error is rendered by mutation state.
  }
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
    <form novalidate @submit.prevent="submit" class="max-w-md space-y-4">
      <AppTextField
        v-model="form.guestName"
        label="Ваше имя"
        placeholder="Иван Иванов"
        autocomplete="name"
        :error="getVisibleError('guestName')"
        @blur="touchField('guestName')"
      />
      <AppTextField
        v-model="form.phone"
        label="Телефон"
        placeholder="+7 900 000-00-00"
        autocomplete="tel"
        inputmode="tel"
        :error="getVisibleError('phone')"
        @blur="touchField('phone')"
      />
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
      <ErrorMessage
        v-if="createBookingMutation.error.value"
        :message="createBookingMutation.error.value.message"
      />
      <div class="flex flex-col gap-3 pt-1 sm:flex-row">
        <button
          type="button"
          @click="emit('back')"
          class="flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-50"
        >
          <img src="/icons/back.svg" width="14" height="14" alt="back" />
          Назад
        </button>
        <button
          type="submit"
          :disabled="createBookingMutation.isPending.value"
          class="rounded-lg bg-amber-700 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-amber-800 disabled:opacity-40"
        >
          {{ createBookingMutation.isPending.value ? 'Бронируем...' : 'Забронировать' }}
        </button>
      </div>
    </form>
  </div>
</template>
