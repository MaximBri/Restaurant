import type { Dish, Review, Hall, Table, Booking } from '../types'

const BASE_URL = 'http://localhost:3001'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, options)
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)
  return res.json() as Promise<T>
}

export const fetchDishes = () => request<Dish[]>('/dishes')
export const fetchDishById = (id: number) => request<Dish>(`/dishes/${id}`)

export const fetchReviewsByDish = (dishId: number) =>
  request<Review[]>(`/reviews?dishId=${dishId}`)

export const fetchHalls = () => request<Hall[]>('/halls')

export const fetchTablesByHall = (hallId: number) =>
  request<Table[]>(`/tables?hallId=${hallId}`)

export const fetchBookings = (hallId: number, date: string) =>
  request<Booking[]>(`/bookings?hallId=${hallId}&date=${date}`)

export const createBooking = (booking: Booking) =>
  request<Booking>('/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(booking),
  })
