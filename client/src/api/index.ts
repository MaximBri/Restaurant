import type {
  AdminBooking,
  AuthUser,
  Booking,
  Dish,
  DishFilters,
  Hall,
  LoginPayload,
  RegisterPayload,
  Review,
  Table,
} from '../types'

const BACKEND_API_URL = import.meta.env.VITE_API_URL || '/api'

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

type BackendRequestConfig = {
  retryOnUnauthorized?: boolean
}

async function request<T>(baseUrl: string, path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${baseUrl}${path}`, options)

  if (!res.ok) {
    let message = `HTTP ${res.status}: ${res.statusText}`

    try {
      const data = await res.json() as { message?: string }
      if (data.message) message = data.message
    } catch {
      // Ignore non-JSON error bodies.
    }

    throw new ApiError(res.status, message)
  }

  if (res.status === 204 || res.status === 205) {
    return undefined as T
  }

  const contentLength = res.headers.get('content-length')
  if (contentLength === '0') {
    return undefined as T
  }

  return res.json() as Promise<T>
}

function dataRequest<T>(path: string, options?: RequestInit) {
  const hasBody = options?.body !== undefined

  return request<T>(BACKEND_API_URL, path, {
    credentials: 'include',
    ...options,
    headers: hasBody
      ? {
          'Content-Type': 'application/json',
          ...(options?.headers ?? {}),
        }
      : options?.headers,
  })
}

const rawBackendRequest = dataRequest

async function tryRefreshToken() {
  await rawBackendRequest<{ message: string; token: string; user: AuthUser }>(
    '/auth/refresh',
    {
      method: 'POST',
    },
  )
}

async function backendRequest<T>(
  path: string,
  options?: RequestInit,
  config?: BackendRequestConfig,
) {
  try {
    return await rawBackendRequest<T>(path, options)
  } catch (error) {
    const shouldRetry =
      (config?.retryOnUnauthorized ?? true) &&
      error instanceof ApiError &&
      error.status === 401

    if (!shouldRetry) {
      throw error
    }

    await tryRefreshToken()
    return rawBackendRequest<T>(path, options)
  }
}

function buildDishQuery(filters?: Partial<DishFilters>) {
  const params = new URLSearchParams()

  if (!filters) return ''
  if (filters.search) params.set('search', filters.search)
  if (filters.category) params.set('category', filters.category)
  if (filters.minCalories !== undefined) params.set('minCalories', String(filters.minCalories))
  if (filters.maxCalories !== undefined) params.set('maxCalories', String(filters.maxCalories))
  if (filters.minWeight !== undefined) params.set('minWeight', String(filters.minWeight))
  if (filters.maxWeight !== undefined) params.set('maxWeight', String(filters.maxWeight))
  if (filters.isSpicy !== null && filters.isSpicy !== undefined) {
    params.set('isSpicy', String(filters.isSpicy))
  }
  if (filters.isChildFriendly !== null && filters.isChildFriendly !== undefined) {
    params.set('isChildFriendly', String(filters.isChildFriendly))
  }

  for (const allergen of filters.excludeAllergens ?? []) {
    params.append('excludeAllergens', allergen)
  }

  const query = params.toString()
  return query ? `?${query}` : ''
}

export const fetchDishes = (filters?: Partial<DishFilters>) =>
  dataRequest<Dish[]>(`/dishes${buildDishQuery(filters)}`)
export const fetchDishById = (id: number) => dataRequest<Dish>(`/dishes/${id}`)

export const fetchReviewsByDish = (dishId: number) =>
  dataRequest<Review[]>(`/reviews?dishId=${dishId}`)

export const fetchHalls = () => dataRequest<Hall[]>('/halls')

export const fetchTablesByHall = (hallId: number) =>
  dataRequest<Table[]>(`/tables?hallId=${hallId}`)

export const fetchBookings = (hallId: number, date: string) =>
  dataRequest<Booking[]>(`/bookings?hallId=${hallId}&date=${date}`)

export const createBooking = (booking: Booking) =>
  backendRequest<Booking>('/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(booking),
  })

export const fetchAdminBookings = () =>
  backendRequest<AdminBooking[]>('/admin/bookings', {
    method: 'GET',
  })

export const deleteAdminBooking = (bookingId: number) =>
  backendRequest<void>(`/admin/bookings/${bookingId}`, {
    method: 'DELETE',
  }, {
    retryOnUnauthorized: false,
  })

export const registerUser = (payload: RegisterPayload) =>
  backendRequest<{ message: string; user: AuthUser & { createdAt: string } }>(
    '/auth/register',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
    {
      retryOnUnauthorized: false,
    },
  )

export const loginUser = (payload: LoginPayload) =>
  backendRequest<{ message: string; token: string; user: AuthUser }>(
    '/auth/login',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
    {
      retryOnUnauthorized: false,
    },
  )

export const fetchCurrentUser = () =>
  backendRequest<{ user: AuthUser }>('/auth/me', {
    method: 'GET',
  })

export const logoutUser = () =>
  backendRequest<{ message: string }>('/auth/logout', {
    method: 'POST',
  }, {
    retryOnUnauthorized: false,
  })
