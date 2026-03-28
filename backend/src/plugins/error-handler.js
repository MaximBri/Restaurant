import { AppError } from '../lib/errors.js';

export function registerErrorHandler(app) {
  app.setErrorHandler((error, request, reply) => {
    if (error.validation) {
      reply.status(400).send({
        message: 'Ошибка валидации',
        details: error.validation,
      });
      return;
    }

    if (error instanceof AppError) {
      reply.status(error.statusCode).send({
        message: error.message,
      });
      return;
    }

    if (error.statusCode) {
      reply.status(error.statusCode).send({
        message: error.message,
      });
      return;
    }

    request.log.error(error);
    reply.status(500).send({
      message: 'Внутренняя ошибка сервера',
    });
  });
}
