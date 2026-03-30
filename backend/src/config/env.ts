import dotenv from 'dotenv';

import type { Env } from '../types.js';

dotenv.config({ quiet: true });

const requireEnv = (name: string, fallback?: string): string => {
  const value = process.env[name] || fallback;

  if (!value) {
    throw new Error(`Environment variable ${name} is required`);
  }

  return value;
}

export const getEnv = (): Env => {
  return {
    nodeEnv: process.env.NODE_ENV || 'development',
    host: process.env.HOST || '127.0.0.1',
    port: Number(process.env.PORT || 3000),
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    logLevel: process.env.LOG_LEVEL || 'info',
    databaseUrl: requireEnv('DATABASE_URL', 'postgresql://localhost:5432/web_laba1'),
    jwtSecret: requireEnv('JWT_SECRET', 'change-me-to-a-long-random-secret'),
    accessTokenCookie: process.env.ACCESS_TOKEN_COOKIE || 'accessToken',
    refreshTokenCookie: process.env.REFRESH_TOKEN_COOKIE || 'refreshToken',
    accessTokenTtl: process.env.ACCESS_TOKEN_TTL || '15m',
    refreshTokenTtl: process.env.REFRESH_TOKEN_TTL || '30d',
    adminEmail: process.env.ADMIN_EMAIL || 'admin@example.com',
    adminPassword: process.env.ADMIN_PASSWORD || 'admin12345',
    adminName: process.env.ADMIN_NAME || 'Admin',
  };
}
