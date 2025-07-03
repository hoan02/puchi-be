# Stage 1: Build app với Nx
FROM node:20-alpine AS builder
WORKDIR /app

# Copy package.json, lockfile, nx.json, tsconfig.base.json
COPY package*.json ./
COPY nx.json ./
COPY tsconfig.base.json ./
COPY eslint.config.mjs ./
COPY apps/api-gateway ./apps/api-gateway
COPY libs ./libs
COPY .env ./.env

# Cài dependencies
RUN npm install

# Build chỉ project api-gateway
RUN npx nx build api-gateway

# Stage 2: Tạo image chạy thực tế
FROM node:20-alpine
WORKDIR /app

# Copy node_modules production từ builder
COPY --from=builder /app/node_modules ./node_modules

# Copy dist của api-gateway từ builder
COPY --from=builder /app/dist/apps/api-gateway ./dist

# Copy file proto nếu cần
COPY proto ./proto
COPY proto /proto

# Copy .env from builder
COPY --from=builder /app/.env ./.env

EXPOSE 3000
CMD ["node", "dist/main.js"] 