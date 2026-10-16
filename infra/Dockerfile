# syntax=docker/dockerfile:1

# ---- Base: install workspace deps ----
FROM node:24-alpine AS base
WORKDIR /app

COPY package.json package-lock.json pnpm-workspace.yaml ./
COPY tsconfig.base.json tsconfig.json ./

# Shared libraries
COPY shared/ ./shared/
# Database package
COPY database/ ./database/
# Backend
COPY backend/ ./backend/
# Scripts (seed)
COPY scripts/ ./scripts/

RUN npm install --workspaces --include-workspace-root

# ---- Build shared + database + backend ----
RUN npm run build:shared \
 && npm run build:database \
 && npm run build:api

# ---- Production runtime ----
FROM node:24-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=5000

COPY package.json package-lock.json ./
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/backend/dist ./backend/dist
COPY --from=base /app/database/dist ./database/dist
COPY --from=base /app/shared/api-zod/dist ./shared/api-zod/dist

EXPOSE 5000
CMD ["node", "backend/dist/index.mjs"]

