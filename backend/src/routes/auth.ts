import { randomUUID } from 'node:crypto';
import type { FastifyInstance, FastifyReply } from 'fastify';
import type { CookieSerializeOptions } from '@fastify/cookie';

import { AppError } from '../lib/errors.js';
import {
  createRefreshTokenSession,
  loginUser,
  registerUser,
  revokeRefreshTokenSession,
  rotateRefreshTokenSession,
} from '../services/auth-service.js';
import type { AuthJwtUser, LoginPayload, RegisterPayload } from '../types.js';

const registerBodySchema = {
  type: 'object',
  required: ['email', 'password', 'name'],
  additionalProperties: false,
  properties: {
    email: { type: 'string', format: 'email' },
    password: { type: 'string', minLength: 8, maxLength: 128 },
    name: { type: 'string', minLength: 2, maxLength: 100 },
  },
};

const loginBodySchema = {
  type: 'object',
  required: ['email', 'password'],
  additionalProperties: false,
  properties: {
    email: { type: 'string', format: 'email' },
    password: { type: 'string', minLength: 8, maxLength: 128 },
  },
};

const authResponseUserSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    email: { type: 'string', format: 'email' },
    name: { type: 'string' },
    role: { type: 'string', enum: ['ADMIN', 'USER'] },
  },
};

const authSuccessResponseSchema = {
  type: 'object',
  properties: {
    message: { type: 'string' },
    token: { type: 'string' },
    user: authResponseUserSchema,
  },
};

function getCookieOptions(app: FastifyInstance): CookieSerializeOptions {
  return {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: app.env.nodeEnv === 'production',
  };
}

function setAuthCookies(
  app: FastifyInstance,
  reply: FastifyReply,
  accessToken: string,
  refreshToken: string,
): void {
  const cookieOptions = getCookieOptions(app);

  reply.setCookie(app.env.accessTokenCookie, accessToken, cookieOptions);
  reply.setCookie(app.env.refreshTokenCookie, refreshToken, cookieOptions);
}

function clearAuthCookies(app: FastifyInstance, reply: FastifyReply): void {
  reply.clearCookie(app.env.accessTokenCookie, {
    path: '/',
  });
  reply.clearCookie(app.env.refreshTokenCookie, {
    path: '/',
  });
}

async function issueAuthTokens(
  app: FastifyInstance,
  reply: FastifyReply,
  user: AuthJwtUser,
) {
  const accessToken = await reply.jwtSign({
    ...user,
    jti: randomUUID(),
  });
  const refreshSession = await createRefreshTokenSession(
    app.db,
    user.id,
    app.env.refreshTokenTtl,
  );

  setAuthCookies(app, reply, accessToken, refreshSession.rawToken);

  return {
    accessToken,
    refreshTokenExpiresAt: refreshSession.expiresAt,
  };
}

export async function authRoutes(app: FastifyInstance): Promise<void> {
  app.post<{ Body: RegisterPayload }>(
    '/register',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Регистрация пользователя',
        body: registerBodySchema,
        response: {
          201: {
            type: 'object',
            properties: {
              message: { type: 'string' },
              user: {
                ...authResponseUserSchema,
                properties: {
                  ...authResponseUserSchema.properties,
                  createdAt: { type: 'string', format: 'date-time' },
                },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const user = await registerUser(app.db, request.body);

      reply.status(201).send({
        message: 'User registered successfully',
        user,
      });
    },
  );

  app.post<{ Body: LoginPayload }>(
    '/login',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Вход пользователя',
        body: loginBodySchema,
        response: {
          200: authSuccessResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const user = await loginUser(app.db, request.body);
      const { accessToken } = await issueAuthTokens(app, reply, user);

      reply.send({
        message: 'Login successful',
        token: accessToken,
        user,
      });
    },
  );

  app.post(
    '/refresh',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Обновление access token по refresh token',
        response: {
          200: authSuccessResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const refreshToken = request.cookies[app.env.refreshTokenCookie];

      if (!refreshToken) {
        throw new AppError(401, 'Unauthorized');
      }

      const session = await rotateRefreshTokenSession(
        app.db,
        refreshToken,
        app.env.refreshTokenTtl,
      );
      const accessToken = await reply.jwtSign({
        ...session.user,
        jti: randomUUID(),
      });

      setAuthCookies(app, reply, accessToken, session.refreshToken);

      reply.send({
        message: 'Token refreshed successfully',
        token: accessToken,
        user: session.user,
      });
    },
  );

  app.get(
    '/me',
    {
      onRequest: [app.authenticate],
      schema: {
        tags: ['Auth'],
        summary: 'Текущий пользователь',
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            type: 'object',
            properties: {
              user: authResponseUserSchema,
            },
          },
        },
      },
    },
    async (request) => ({
      user: request.user,
    }),
  );

  app.post(
    '/logout',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Выход пользователя',
        response: {
          200: {
            type: 'object',
            properties: {
              message: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const refreshToken = request.cookies[app.env.refreshTokenCookie];

      if (refreshToken) {
        await revokeRefreshTokenSession(app.db, refreshToken);
      }

      clearAuthCookies(app, reply);

      reply.send({
        message: 'Logout successful',
      });
    },
  );
}
