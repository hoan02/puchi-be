# Dockerfile for notification-service
# Stage 1: Build app với Nx
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package.json, lockfile, nx.json, tsconfig.base.json
COPY package*.json ./
COPY nx.json ./
COPY tsconfig.base.json ./
COPY eslint.config.mjs ./
COPY apps/notification-service ./apps/notification-service
COPY libs ./libs
COPY .env ./.env

# Cài dependencies
RUN npm install
RUN npx prisma generate --schema=apps/notification-service/prisma/schema.prisma

# Build chỉ project notification-service
RUN npx nx build notification-service

# Stage 2: Tạo image chạy thực tế
FROM node:20-alpine
WORKDIR /app

# Copy node_modules production từ builder
COPY --from=builder /app/node_modules ./node_modules

# Copy dist của notification-service từ builder
COPY --from=builder /app/dist/apps/notification-service ./dist

# Copy file proto nếu cần
COPY proto ./proto
COPY proto /proto

# Copy .env from builder
COPY --from=builder /app/.env ./.env

EXPOSE 50054
CMD ["node", "dist/main.js"] 