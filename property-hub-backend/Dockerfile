# Stage 1: Build
FROM node:20-alpine AS builder
RUN apk add --no-cache openssl

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@8

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY tsconfig*.json ./
COPY nest-cli.json ./

# Install dependencies
RUN pnpm install --no-frozen-lockfile

# Copy source code
COPY src ./src
COPY prisma ./prisma

# Generate Prisma Client
RUN npx prisma generate

# Build application
RUN pnpm run build

# Stage 2: Production
FROM node:20-alpine
RUN apk add --no-cache openssl

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@8

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install production dependencies only
RUN pnpm install --prod --no-frozen-lockfile

# Copy Prisma schema
COPY prisma ./prisma

# Copy built application from builder
COPY --from=builder /app/dist ./dist

# Generate Prisma Client in production stage
RUN npx prisma generate

# Expose port
EXPOSE 3001

# Run migrations and start application
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
