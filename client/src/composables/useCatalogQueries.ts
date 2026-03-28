import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'

import {
  createBooking,
  deleteAdminBooking,
  fetchAdminBookings,
  fetchBookings,
  fetchDishById,
  fetchDishes,
  fetchHalls,
  fetchReviewsByDish,
  fetchTablesByHall,
} from '../api'
import type { AdminBooking, Booking, DishFilters } from '../types'
import { queryKeys } from './queryKeys'

function normalizeFilters(filters: Partial<DishFilters>) {
  const normalized = {
    search: filters.search ?? '',
    category: filters.category ?? '',
    minCalories: filters.minCalories ?? 0,
    maxCalories: filters.maxCalories ?? 2000,
    minWeight: filters.minWeight ?? 0,
    maxWeight: filters.maxWeight ?? 2000,
    isSpicy: filters.isSpicy ?? null,
    isChildFriendly: filters.isChildFriendly ?? null,
    excludeAllergens: [...(filters.excludeAllergens ?? [])].sort(),
  }

  return normalized
}

export function useDishesQuery(filters: MaybeRefOrGetter<Partial<DishFilters>>) {
  const normalizedFilters = computed(() => normalizeFilters(toValue(filters)))
  const filtersKey = computed(() => JSON.stringify(normalizedFilters.value))

  return useQuery({
    queryKey: computed(() => queryKeys.dishes(filtersKey.value)),
    queryFn: () => fetchDishes(normalizedFilters.value),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  })
}

export function useDishQuery(id: MaybeRefOrGetter<number>) {
  return useQuery({
    queryKey: computed(() => queryKeys.dish(toValue(id))),
    queryFn: () => fetchDishById(toValue(id)),
    enabled: computed(() => Number.isFinite(toValue(id)) && toValue(id) > 0),
    staleTime: 60_000,
  })
}

export function useReviewsQuery(dishId: MaybeRefOrGetter<number>) {
  return useQuery({
    queryKey: computed(() => queryKeys.reviews(toValue(dishId))),
    queryFn: () => fetchReviewsByDish(toValue(dishId)),
    enabled: computed(() => Number.isFinite(toValue(dishId)) && toValue(dishId) > 0),
    staleTime: 60_000,
  })
}

export function useHallsQuery() {
  return useQuery({
    queryKey: queryKeys.halls(),
    queryFn: fetchHalls,
    staleTime: 60_000,
  })
}

export function useTablesQuery(hallId: MaybeRefOrGetter<number | null>) {
  return useQuery({
    queryKey: computed(() => queryKeys.tables(toValue(hallId) ?? 0)),
    queryFn: () => fetchTablesByHall(toValue(hallId) ?? 0),
    enabled: computed(() => Boolean(toValue(hallId))),
    staleTime: 60_000,
  })
}

export function useBookingsQuery(
  hallId: MaybeRefOrGetter<number | null>,
  date: MaybeRefOrGetter<string>,
) {
  return useQuery({
    queryKey: computed(() => queryKeys.bookings(toValue(hallId) ?? 0, toValue(date))),
    queryFn: () => fetchBookings(toValue(hallId) ?? 0, toValue(date)),
    enabled: computed(() => Boolean(toValue(hallId)) && Boolean(toValue(date))),
    staleTime: 15_000,
  })
}

export function useCreateBookingMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: Booking) => createBooking(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.bookings(variables.hallId, variables.date),
      })
    },
  })
}

export function useAdminBookingsQuery() {
  return useQuery<AdminBooking[]>({
    queryKey: queryKeys.adminBookings(),
    queryFn: fetchAdminBookings,
    staleTime: 10_000,
  })
}

export function useDeleteBookingMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (bookingId: number) => deleteAdminBooking(bookingId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.adminBookings(),
      })
    },
  })
}
