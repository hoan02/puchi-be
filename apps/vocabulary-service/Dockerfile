# Dockerfile for vocabulary-service
# Stage 1: Build app với Nx
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package.json, lockfile, nx.json, tsconfig.base.json từ root
COPY ../../package*.json ./
COPY ../../nx.json ./
COPY ../../tsconfig.base.json ./
COPY ../../eslint.config.mjs ./
COPY . .
COPY ../libs ../libs
COPY ../proto ../proto
COPY ../../.env ./.env

# Cài dependencies
RUN npm install
RUN npx prisma generate --schema=prisma/schema.prisma

# Build chỉ project vocabulary-service
RUN npx nx build vocabulary-service

# Stage 2: Tạo image chạy thực tế
FROM node:20-alpine
WORKDIR /app

# Copy node_modules production từ builder
COPY --from=builder /app/node_modules ./node_modules

# Copy dist của vocabulary-service từ builder
COPY --from=builder /app/dist/apps/vocabulary-service ./dist

# Copy file proto nếu cần
COPY --from=builder /app/../proto /proto

# Copy .env from builder
COPY --from=builder /app/.env ./.env

EXPOSE 50057
CMD ["node", "dist/main.js"] 