FROM node:20-alpine AS builder

WORKDIR /app

# Dependencies für better-sqlite3
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build app
RUN npm run build

# Production image
FROM node:20-alpine

WORKDIR /app

# Dependencies für better-sqlite3
RUN apk add --no-cache python3 make g++

# Copy package files
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built app
COPY --from=builder /app/build ./build
COPY --from=builder /app/.svelte-kit ./.svelte-kit
COPY --from=builder /app/package.json ./
COPY --from=builder /app/server.ts ./server.ts
COPY --from=builder /app/src/lib/server ./src/lib/server
COPY --from=builder /app/node_modules ./node_modules

# Create data directory
RUN mkdir -p /app/data

# Expose port
EXPOSE 3000

# Start app with custom server
CMD ["node", "--import", "tsx", "server.ts"]

