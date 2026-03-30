export type UserRole = 'ADMIN' | 'USER';

export type Env = {
  nodeEnv: string;
  host: string;
  port: number;
  corsOrigin: string;
  logLevel: string;
  databaseUrl: string;
  jwtSecret: string;
  accessTokenCookie: string;
  refreshTokenCookie: string;
  accessTokenTtl: string;
  refreshTokenTtl: string;
  adminEmail: string;
  adminPassword: string;
  adminName: string;
};

export type AuthJwtUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
};

export type RegisterPayload = {
  email: string;
  password: string;
  name: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type DishFilters = {
  search?: string;
  category?: string;
  minCalories?: number;
  maxCalories?: number;
  minWeight?: number;
  maxWeight?: number;
  isSpicy?: boolean;
  isChildFriendly?: boolean;
  excludeAllergens?: string[];
};

export type BookingPayload = {
  tableId: number;
  hallId: number;
  date: string;
  guestName: string;
  phone: string;
  guestsCount: number;
};
