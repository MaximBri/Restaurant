<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'

import AppTextField from '../ui/AppTextField.vue'
import { useAuthStore } from '../../stores/auth'
import {
  validateEmail,
  validateName,
  validatePassword,
} from '../../utils/validation'

type Mode = 'login' | 'register'

const props = defineProps<{
  open: boolean
  initialMode?: Mode
}>()

const emit = defineEmits<{
  close: []
}>()

const authStore = useAuthStore()
const mode = ref<Mode>(props.initialMode ?? 'login')
const formError = ref<string | null>(null)
const touched = reactive({
  name: false,
  email: false,
  password: false,
})

const form = reactive({
  name: '',
  email: '',
  password: '',
})

const fieldErrors = computed(() => ({
  name: mode.value === 'register' ? validateName(form.name, 'Имя') : null,
  email: validateEmail(form.email),
  password: validatePassword(form.password),
}))

const title = computed(() =>
  mode.value === 'login' ? 'Вход в аккаунт' : 'Регистрация',
)

watch(
  () => props.initialMode,
  (value) => {
    if (value) mode.value = value
  },
)

watch(
  () => props.open,
  (isOpen) => {
    if (isOpen) {
      formError.value = null
      return
    }

    form.name = ''
    form.email = ''
    form.password = ''
    formError.value = null
    touched.name = false
    touched.email = false
    touched.password = false
  },
)

function getVisibleError(field: 'name' | 'email' | 'password') {
  return touched[field] ? fieldErrors.value[field] : null
}

function touchField(field: 'name' | 'email' | 'password') {
  touched[field] = true
}

async function handleSubmit() {
  formError.value = null
  touched.name = true
  touched.email = true
  touched.password = true

  if (fieldErrors.value.name || fieldErrors.value.email || fieldErrors.value.password) {
    return
  }

  try {
    if (mode.value === 'register') {
      await authStore.register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      })

      await authStore.login({
        email: form.email.trim(),
        password: form.password,
      })
    } else {
      await authStore.login({
        email: form.email.trim(),
        password: form.password,
      })
    }

    emit('close')
  } catch (e) {
    formError.value = authStore.error || 'Не удалось выполнить запрос'
  }
}
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4"
    @click.self="emit('close')"
  >
    <div class="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
      <div class="mb-6 flex items-start justify-between gap-4">
        <div>
          <p class="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-amber-700">
            Русский ресторан
          </p>
          <h2 class="text-2xl font-bold text-stone-900">{{ title }}</h2>
          <p class="mt-2 text-sm text-stone-500">
            {{ mode === 'login' ? 'Войдите, чтобы открыть личный доступ.' : 'Создайте аккаунт для дальнейшей работы с сервисом.' }}
          </p>
        </div>

        <button
          type="button"
          class="flex h-10 w-10 items-center justify-center rounded-xl text-stone-400 transition hover:bg-stone-100 hover:text-stone-700"
          @click="emit('close')"
        >
          ✕
        </button>
      </div>

      <div class="mb-5 grid grid-cols-2 rounded-2xl bg-stone-100 p-1">
        <button
          type="button"
          class="rounded-2xl px-4 py-2 text-sm font-medium transition"
          :class="mode === 'login' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500'"
          @click="mode = 'login'"
        >
          Вход
        </button>
        <button
          type="button"
          class="rounded-2xl px-4 py-2 text-sm font-medium transition"
          :class="mode === 'register' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500'"
          @click="mode = 'register'"
        >
          Регистрация
        </button>
      </div>

      <form class="space-y-4" novalidate @submit.prevent="handleSubmit">
        <AppTextField
          v-if="mode === 'register'"
          v-model="form.name"
          label="Имя"
          placeholder="Иван Петров"
          autocomplete="name"
          :error="getVisibleError('name')"
          @blur="touchField('name')"
        />

        <AppTextField
          v-model="form.email"
          label="Email"
          placeholder="mail@example.com"
          autocomplete="email"
          inputmode="email"
          :error="getVisibleError('email')"
          @blur="touchField('email')"
        />

        <AppTextField
          v-model="form.password"
          label="Пароль"
          type="password"
          placeholder="Не меньше 8 символов"
          autocomplete="current-password"
          :error="getVisibleError('password')"
          @blur="touchField('password')"
        />

        <p
          v-if="formError || authStore.error"
          class="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {{ formError || authStore.error }}
        </p>

        <button
          type="submit"
          class="w-full rounded-2xl bg-amber-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="authStore.loading"
        >
          {{ authStore.loading ? 'Подождите...' : mode === 'login' ? 'Войти' : 'Зарегистрироваться' }}
        </button>
      </form>
    </div>
  </div>
</template>
