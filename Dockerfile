# your node version
FROM node:20-alpine AS deps-prod

WORKDIR /app

COPY ./package*.json .

RUN npm install --omit=dev --timeout=300000 --retry=3

FROM node:20-alpine AS build

WORKDIR /app

COPY ./package*.json .

RUN npm install --include=dev --timeout=300000 --retry=3

COPY . .

RUN npm run build

FROM node:20-alpine AS prod

# Устанавливаем wget для healthcheck
RUN apk add --no-cache wget

WORKDIR /app

COPY --from=build /app/package*.json .
COPY --from=deps-prod /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

# Копируем credentials для Google API
COPY --from=build /app/credentials ./credentials