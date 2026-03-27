import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Hall, Table, Booking } from '../types'
import { fetchHalls, fetchTablesByHall, fetchBookings, createBooking } from '../api'

export const useBookingStore = defineStore('booking', () => {
  const halls = ref<Hall[]>([])
  const tables = ref<Table[]>([])
  const bookings = ref<Booking[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const success = ref(false)

  const loadHalls = async () => {
    loading.value = true
    error.value = null
    try {
      halls.value = await fetchHalls()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Ошибка загрузки залов'
    } finally {
      loading.value = false
    }
  }

  const loadTablesAndBookings = async (hallId: number, date: string) => {
    loading.value = true
    error.value = null
    try {
      const [tablesData, bookingsData] = await Promise.all([
        fetchTablesByHall(hallId),
        fetchBookings(hallId, date),
      ])
      tables.value = tablesData
      bookings.value = bookingsData
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Ошибка загрузки данных зала'
    } finally {
      loading.value = false
    }
  }

  const isTableBooked = (tableId: number): boolean => {
    return bookings.value.some((b) => b.tableId === tableId)
  }

  const book = async (booking: Booking) => {
    loading.value = true
    error.value = null
    success.value = false
    try {
      const created = await createBooking(booking)
      bookings.value.push(created)
      success.value = true
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Ошибка бронирования'
    } finally {
      loading.value = false
    }
  }

  const reset = () => {
    success.value = false
    error.value = null
  }

  return {
    halls,
    tables,
    bookings,
    loading,
    error,
    success,
    loadHalls,
    loadTablesAndBookings,
    isTableBooked,
    book,
    reset,
  }
})
