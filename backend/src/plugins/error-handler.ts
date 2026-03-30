import type { FastifyInstance } from 'fastify'

import { AppError } from '../lib/errors.js'

type ValidationError = Error & {
  validation?: unknown
  statusCode?: number
}

export const registerErrorHandler = (app: FastifyInstance): void => {
  app.setErrorHandler((error: ValidationError, request, reply) => {
    const typedError = error

    if (typedError.validation) {
      reply.status(400).send({
        message: 'Ошибка валидации',
        details: typedError.validation,
      })
      return
    }

    if (typedError instanceof AppError) {
      reply.status(typedError.statusCode).send({
        message: typedError.message,
      })
      return
    }

    if (typedError.statusCode) {
      reply.status(typedError.statusCode).send({
        message: typedError.message,
      })
      return
    }

    request.log.error(typedError)
    reply.status(500).send({
      message: 'Внутренняя ошибка сервера',
    })
  })
}
