import { and, eq, gt, isNull } from 'drizzle-orm';

import { AppError } from '../lib/errors.js';
import { refreshTokensTable, usersTable } from '../db/schema.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { generateRefreshToken, hashToken } from '../utils/token.js';

export function toPublicUser(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}

export async function registerUser(db, payload) {
  const existingUser = await db.query.usersTable.findFirst({
    where: eq(usersTable.email, payload.email),
  });

  if (existingUser) {
    throw new AppError(409, 'User with this email already exists');
  }

  const passwordHash = await hashPassword(payload.password);

  const [user] = await db
    .insert(usersTable)
    .values({
      email: payload.email,
      name: payload.name,
      passwordHash,
      role: 'USER',
    })
    .returning({
      id: usersTable.id,
      email: usersTable.email,
      name: usersTable.name,
      role: usersTable.role,
      createdAt: usersTable.createdAt,
    });

  return user;
}

export async function loginUser(db, payload) {
  const user = await db.query.usersTable.findFirst({
    where: eq(usersTable.email, payload.email),
  });

  if (!user || !user.isActive) {
    throw new AppError(401, 'Invalid email or password');
  }

  const isPasswordValid = await verifyPassword(payload.password, user.passwordHash);

  if (!isPasswordValid) {
    throw new AppError(401, 'Invalid email or password');
  }

  return toPublicUser(user);
}

function getExpiresAt(ttlMs) {
  return new Date(Date.now() + ttlMs);
}

function parseDurationToMs(value) {
  const match = /^(\d+)([smhd])$/.exec(value);

  if (!match) {
    throw new Error(`Unsupported duration format: ${value}`);
  }

  const amount = Number(match[1]);
  const unit = match[2];

  const multipliers = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  return amount * multipliers[unit];
}

export async function createRefreshTokenSession(db, userId, refreshTokenTtl) {
  const rawToken = generateRefreshToken();
  const tokenHash = hashToken(rawToken);
  const expiresAt = getExpiresAt(parseDurationToMs(refreshTokenTtl));

  await db.insert(refreshTokensTable).values({
    userId,
    tokenHash,
    expiresAt,
  });

  return {
    rawToken,
    expiresAt,
  };
}

export async function rotateRefreshTokenSession(db, rawToken, refreshTokenTtl) {
  const tokenHash = hashToken(rawToken);

  const [storedToken] = await db
    .select({
      id: refreshTokensTable.id,
      userId: refreshTokensTable.userId,
      expiresAt: refreshTokensTable.expiresAt,
      revokedAt: refreshTokensTable.revokedAt,
      user: {
        id: usersTable.id,
        email: usersTable.email,
        name: usersTable.name,
        role: usersTable.role,
        isActive: usersTable.isActive,
      },
    })
    .from(refreshTokensTable)
    .innerJoin(usersTable, eq(refreshTokensTable.userId, usersTable.id))
    .where(
      and(
        eq(refreshTokensTable.tokenHash, tokenHash),
        isNull(refreshTokensTable.revokedAt),
        gt(refreshTokensTable.expiresAt, new Date()),
      ),
    )
    .limit(1);

  if (!storedToken || !storedToken.user.isActive) {
    throw new AppError(401, 'Unauthorized');
  }

  await db
    .update(refreshTokensTable)
    .set({
      revokedAt: new Date(),
    })
    .where(eq(refreshTokensTable.id, storedToken.id));

  const nextSession = await createRefreshTokenSession(
    db,
    storedToken.userId,
    refreshTokenTtl,
  );

  return {
    user: toPublicUser(storedToken.user),
    refreshToken: nextSession.rawToken,
    refreshTokenExpiresAt: nextSession.expiresAt,
  };
}

export async function revokeRefreshTokenSession(db, rawToken) {
  const tokenHash = hashToken(rawToken);

  await db
    .update(refreshTokensTable)
    .set({
      revokedAt: new Date(),
    })
    .where(
      and(
        eq(refreshTokensTable.tokenHash, tokenHash),
        isNull(refreshTokensTable.revokedAt),
      ),
    );
}
