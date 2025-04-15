# Stage 1: Base
FROM node:22.13.0-alpine AS base
RUN apk update && \
  apk add --no-cache libc6-compat

# Install and use the correct pnpm version
ENV COREPACK_INTEGRITY_KEYS=0
RUN --mount=type=bind,source=package.json,target=package.json \
  corepack enable

LABEL fly_launch_runtime="NodeJS"

# Stage 2: Prune
FROM base AS pruner
ARG PROJECT
RUN test -n "$PROJECT" || { echo "ERROR: PROJECT must be set"; exit 1; }

WORKDIR /app
COPY . .
# Keep only relevant files
RUN pnpx turbo prune ${PROJECT} --docker

# Stage 3: Build
FROM base AS builder
ARG PROJECT

WORKDIR /app
# Copy relevant files
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=pruner /app/out/full/ .

# Install dependencies
RUN --mount=type=cache,id=pnpm,target=/pnpm/store \
  pnpm install

# Build
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
RUN pnpm build

# Prune for production
RUN pnpm --filter ${PROJECT} --prod deploy pruned

# Stage 4: Run
FROM base AS runner
ARG PROJECT

RUN addgroup --system --gid 1001 nodejs && \
  adduser --system --uid 1001 nodejs
USER nodejs

WORKDIR /app
COPY --from=builder --chown=nodejs:nodejs /app/pruned .

ARG PORT=3000
ENV PORT=${PORT}
ENV NODE_ENV=production
EXPOSE ${PORT}

CMD ["pnpm", "start"]
