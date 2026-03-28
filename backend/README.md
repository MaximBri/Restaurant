# Backend

Backend для лабораторной на `Node.js + Fastify + PostgreSQL + Drizzle`.

## Стек

- Fastify
- PostgreSQL
- Drizzle ORM
- JWT + cookie auth
- Swagger / OpenAPI

## Запуск

1. Скопировать `.env.example` в `.env`
   Если используешь локальный PostgreSQL от Homebrew, строки `postgresql://localhost:5432/...` обычно достаточно: драйвер возьмёт текущего пользователя ОС.
2. Поднять PostgreSQL:
   `docker compose up -d`
3. Установить зависимости:
   `npm install`
4. Сгенерировать миграции при изменении схемы:
   `npm run db:generate`
5. Применить миграции:
   `npm run db:migrate`
6. Импортировать каталог, отзывы, залы, столики и стартовые бронирования:
   `npm run seed:static`
7. Создать администратора:
   `npm run seed:admin`
8. Запустить сервер:
   `npm run dev`

## Документация

Swagger UI доступен по адресу `http://localhost:3000/docs`.
