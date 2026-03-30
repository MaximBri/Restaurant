FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY drizzle ./drizzle
COPY scripts ./scripts
COPY src ./src
COPY drizzle.config.ts ./
COPY tsconfig.json ./

RUN npm run build

FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY drizzle ./drizzle
COPY --from=build /app/dist ./dist
COPY docker/start.sh /usr/local/bin/start-backend.sh
RUN chmod +x /usr/local/bin/start-backend.sh

EXPOSE 3000

CMD ["start-backend.sh"]
