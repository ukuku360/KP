FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9.15.1 --activate

COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml ./
COPY turbo.json ./

COPY apps/web/package.json ./apps/web/package.json
COPY apps/crawler/package.json ./apps/crawler/package.json
COPY packages/database/package.json ./packages/database/package.json

RUN pnpm install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.15.1 --activate

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN pnpm turbo build --filter=@politics/crawler...

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

# Don't run as root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 crawler

COPY --from=builder /app ./
# We need to install prod deps again or pruned? 
# For crawler, we need the whole monorepo structure effectively or bundled?
# Since it's a simple TS app, we can just run the dist.
# But for simplicity in monorepo, let's keep the structure for now since it needs database package.

USER crawler

CMD ["node", "apps/crawler/dist/index.js"]
