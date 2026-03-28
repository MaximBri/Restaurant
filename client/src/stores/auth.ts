import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

import type { AuthUser, LoginPayload, RegisterPayload } from '../types'
import {
  ApiError,
  fetchCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
} from '../api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(null)
  const loading = ref(false)
  const initialized = ref(false)
  const error = ref<string | null>(null)
  const authModalOpen = ref(false)
  const authModalMode = ref<'login' | 'register'>('login')

  const isAuthenticated = computed(() => Boolean(user.value))
  const isAdmin = computed(() => user.value?.role === 'ADMIN')

  function getAuthErrorMessage(error: unknown, action: 'login' | 'register' | 'logout') {
    if (error instanceof ApiError) {
      if (action === 'login') {
        if (error.status === 401) return 'Неверная почта или пароль'
        if (error.status === 400) return 'Проверьте корректность введённых данных'
      }

      if (action === 'register') {
        if (error.status === 409) return 'Пользователь с такой почтой уже существует'
        if (error.status === 400) return 'Проверьте корректность введённых данных'
      }

      if (action === 'logout' && error.status === 401) {
        return 'Сессия уже недействительна'
      }
    }

    if (action === 'login') return 'Не удалось выполнить вход'
    if (action === 'register') return 'Не удалось зарегистрироваться'
    return 'Не удалось выполнить выход'
  }

  async function init() {
    if (initialized.value) return

    loading.value = true
    error.value = null

    try {
      const response = await fetchCurrentUser()
      user.value = response.user
    } catch {
      user.value = null
    } finally {
      loading.value = false
      initialized.value = true
    }
  }

  function openAuthModal(mode: 'login' | 'register' = 'login') {
    authModalMode.value = mode
    authModalOpen.value = true
  }

  function closeAuthModal() {
    authModalOpen.value = false
  }

  async function login(payload: LoginPayload) {
    loading.value = true
    error.value = null

    try {
      const response = await loginUser(payload)
      user.value = response.user
      return response
    } catch (e) {
      error.value = getAuthErrorMessage(e, 'login')
      throw e
    } finally {
      loading.value = false
      initialized.value = true
    }
  }

  async function register(payload: RegisterPayload) {
    loading.value = true
    error.value = null

    try {
      const response = await registerUser(payload)
      return response
    } catch (e) {
      error.value = getAuthErrorMessage(e, 'register')
      throw e
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    loading.value = true
    error.value = null

    try {
      await logoutUser()
      user.value = null
    } catch (e) {
      error.value = getAuthErrorMessage(e, 'logout')
      throw e
    } finally {
      loading.value = false
      initialized.value = true
    }
  }

  return {
    user,
    loading,
    initialized,
    error,
    authModalOpen,
    authModalMode,
    isAuthenticated,
    isAdmin,
    openAuthModal,
    closeAuthModal,
    init,
    login,
    register,
    logout,
  }
})
