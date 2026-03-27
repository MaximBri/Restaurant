export const queryKeys = {
  dishes: (filtersKey: string) => ['dishes', filtersKey] as const,
  dish: (id: number) => ['dish', id] as const,
  reviews: (dishId: number) => ['reviews', dishId] as const,
  halls: () => ['halls'] as const,
  tables: (hallId: number) => ['tables', hallId] as const,
  bookings: (hallId: number, date: string) => ['bookings', hallId, date] as const,
  adminBookings: () => ['admin-bookings'] as const,
}
