# Stage 1: Install dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# Stage 2: Build the Next.js application
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time env var needed for Next.js server actions config
ARG NEXTAUTH_URL
ENV NEXTAUTH_URL=${NEXTAUTH_URL}

RUN npm run build

# Stage 3: Production runtime (minimal image)
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
# Cloud Run requires binding to port 8080 on 0.0.0.0
ENV PORT=8080
ENV HOSTNAME="0.0.0.0"

# Copy the standalone build (includes traced node_modules subset)
COPY --from=builder /app/.next/standalone ./

# Copy static assets (standalone build excludes these intentionally for CDN use)
COPY --from=builder /app/.next/static ./.next/static

# Copy public assets
COPY --from=builder /app/public ./public

EXPOSE 8080

CMD ["node", "server.js"]
