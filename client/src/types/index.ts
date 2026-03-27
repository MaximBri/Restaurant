export interface Dish {
  id: number
  name: string
  category: string
  weight: number
  calories: number
  price: number
  description: string
  ingredients: string[]
  imageUrl: string
  isSpicy: boolean
  isChildFriendly: boolean
  allergens: string[]
}

export interface Review {
  id: number
  dishId: number
  author: string
  text: string
  photoUrl: string
  rating: number
}

export interface Hall {
  id: number
  name: string
  description: string
  imageUrl: string
}

export interface Table {
  id: number
  hallId: number
  number: number
  seats: number
  x: number
  y: number
}

export interface Booking {
  id?: number
  tableId: number
  hallId: number
  date: string
  guestName: string
  phone: string
  guestsCount: number
}

export interface DishFilters {
  search: string
  category: string
  minCalories: number
  maxCalories: number
  minWeight: number
  maxWeight: number
  isSpicy: boolean | null
  isChildFriendly: boolean | null
  excludeAllergens: string[]
}
