# syntax=docker.io/docker/dockerfile:1

############################
# Base
############################
FROM node:20-bookworm-slim AS base
WORKDIR /app

# Needed for Prisma engines TLS + some deps
RUN apt-get update && apt-get install -y --no-install-recommends \
    ca-certificates openssl \
  && rm -rf /var/lib/apt/lists/*


############################
# Dependencies
############################
FROM base AS deps
COPY package.json package-lock.json ./
# Install deps without running lifecycle scripts
RUN npm ci --no-audit --no-fund --ignore-scripts


############################
# Build
############################
FROM base AS builder
ENV NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Prisma generate (Prisma 5)
# Ensure DATABASE_URL exists at build time if your schema uses env("DATABASE_URL")
ENV DATABASE_URL="postgresql://dummy:password@localhost:5432/db"
RUN npx prisma generate

# Build Next.js (standalone)
RUN npm run build


############################
# Runner
############################
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

# Create non-root user
RUN groupadd -g 1001 nodejs \
 && useradd -m -u 1001 -g nodejs nextjs

# Copy standalone output
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy Prisma schema + migrations (REQUIRED for migrate deploy)
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

# Ensure Prisma CLI exists at runtime (so we don't rely on npx downloading)
# Prisma is often in devDependencies; standalone won't include it.
RUN npm install --no-audit --no-fund prisma@5.20.0

# Start script
COPY --chown=nextjs:nodejs start.sh ./start.sh
RUN chmod +x ./start.sh

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["./start.sh"]


