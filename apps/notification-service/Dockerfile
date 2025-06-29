# Dockerfile for notification-service
FROM node:20-alpine AS builder
WORKDIR /app
COPY ../../package*.json ./
COPY ../../tsconfig.base.json ./
COPY . .
RUN npm install
RUN npm run build:notification

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist/apps/notification-service ./dist
COPY ../../package*.json ./
RUN npm install --omit=dev
ENV NODE_ENV=production
CMD ["node", "dist/main.js"] 