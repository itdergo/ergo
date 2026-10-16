# ERGO Contracts Philippines

A fullstack web application for ERGO Contracts Philippines — thoughtfully designed furniture and workplace solutions for offices, institutions, and homes.

## Tech Stack

- **Frontend**: Vite + React 19 + TypeScript + Tailwind CSS 4
- **UI Components**: shadcn-ui, Radix UI, Lucide React, Framer Motion, Recharts, Sonner
- **Backend**: Express 5 + Drizzle ORM + PGlite (embedded PostgreSQL)
- **Database**: PostgreSQL via PGlite (no external DB required)
- **API**: OpenAPI-first with Zod schemas + Orval code generation
- **Build**: `npm run build` → libs + frontend; `npm run dev` → concurrently front + back

## Quick Start

```bash
npm install
npm run dev
```

- Frontend: `http://localhost:3000` (served by Vite)
- API: `http://localhost:5000/api/*`
- Admin: created by `npm run seed`. Set `ADMIN_PASSWORD` before seeding, or the seed generates a strong one and prints it once.

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start concurrently: `npm run dev:api` + `npm run dev:frontend` |
| `npm run build` | Full build: `build:libs` + `build:api` + `build:frontend` |
| `npm run typecheck` | Type-check both frontend and API |
| `npm run seed` | Seed the database with admin user + categories + products + industries |
| `npm run db:push` | Push schema to the embedded PGlite database |

## Environment Variables

Copy `.env.example` and adjust as needed:

```env
DATABASE_URL=postgresql://ergo:***@localhost:5432/ergo_contracts
PORT=5000
NODE_ENV=development
VITE_API_URL=http://localhost:5000/api
JWT_SECRET=<openssl rand -base64 48>
CORS_ORIGINS=http://localhost:3000
ADMIN_EMAIL=admin@ergo.com.ph
ADMIN_PASSWORD=
BASE_PATH=/
```

## Project Structure

```
ERGOContractsWEBV1/
├── frontend/          ← Vite + React 19 web app (nginx in prod)
├── backend/           ← Express 5 API (+ Redis cache, helmet, graceful shutdown)
├── database/          ← Drizzle ORM schema + migrations (Postgres)
├── shared/            ← Shared workspace packages (api-zod, api-client-react, api-spec)
├── scripts/           ← Database seed script
├── infra/             ← Dockerfiles, docker-compose, nginx config
├── .github/workflows/ ← CI/CD (lint, typecheck, build, docker)
├── .env.example       ← Environment template (DO NOT commit real creds)
└── package.json       ← npm workspaces monorepo root
```

## Services

| Service  | Package           | Port |
|----------|-------------------|------|
| Frontend | `@ergo/frontend`  | 3000 |
| Backend  | `@ergo/backend`   | 5000 |
| Postgres | (external/infra)  | 5432 |
| Redis    | (optional cache)  | 6379 |

Redis is optional — the backend runs without it and uses it for caching when `REDIS_URL` is set.

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Run frontend + backend concurrently |
| `npm run build` | Build shared → database → backend → frontend |
| `npm run lint` / `lint:fix` | ESLint (flat config) |
| `npm run typecheck` | Type-check frontend + backend |
| `npm run format` | Prettier write |
| `npm run verify` | lint + typecheck + build (CI gate) |
| `npm run seed` | Seed the database |
| `npm run db:push` / `db:generate` | Drizzle schema push / migrations |

## Docker

```bash
docker compose -f infra/docker-compose.yml up --build
```

Runs api (5000), frontend (80), postgres (5432), and redis (6379) with healthchecks.

## API Endpoints

Auth model: all write endpoints and anything marked (admin) require a Bearer JWT
obtained from `POST /api/auth/login`. Public reads (products, categories,
solutions, industries, resources) are unauthenticated and carry a public
Cache-Control; inquiries and auth responses are `no-store`.

| Method | Endpoint | Description |
|---|---|---|
| `GET /api/healthz` | Health check |
| `GET /api/categories` | List all categories |
| `GET /api/products` | List products with pagination/filtering |
| `GET /api/products/:slug` | Get single product |
| `POST /api/products` | Create product (admin) |
| `PUT /api/products/:id` | Update product (admin) |
| `DELETE /api/products/:id` | Delete product (admin) |
| `GET /api/industries` | List industries |
| `GET /api/resources` | List resources |
| `GET /api/solutions` | List solutions |
| `GET /api/inquiries` | List inquiries (admin) |
| `POST /api/inquiries` | Submit inquiry (public) |
| `PUT /api/inquiries/:id` | Update inquiry status (admin) |
| `DELETE /api/inquiries/:id` | Delete inquiry (admin) |

## SEO & routing

The site uses real routes (wouter) rather than hash anchors, so each page is a
distinct, indexable URL with its own title, description, canonical and Open Graph
tags. `src/routes.json` is the single source of truth and drives the app router,
the sitemap generator and the prerender pass.

| Route | Page |
|---|---|
| `/` | Home — full landing page |
| `/products` | Product index |
| `/products/:slug` | Product detail (Product + BreadcrumbList schema) |
| `/solutions` | Workplace solutions |
| `/industries` | Industries served |
| `/projects` | Featured installations |
| `/resources` | Catalogues & specifications |
| `/contact` | Consultation request |

The build runs three steps:

1. `vite build` — bundles the app.
2. `node scripts/gen-sitemap.mjs` — writes `sitemap.xml` from the route table plus
   the live product list (hash URLs are never emitted; crawlers treat every
   fragment as the same document).
3. `node scripts/prerender.mjs` — serves the built output, renders every route
   with headless Chromium (`--dump-dom`) and writes real HTML to
   `<route>/index.html`, so crawlers get content instead of an empty `<div id="root">`.
   nginx serves those files via its existing `try_files $uri $uri/ /index.html`.

Structured data (Organization, LocalBusiness, WebSite, BreadcrumbList, ItemList,
Product) is injected per route by `src/lib/structured-data.ts` and baked into the
prerendered HTML.

Prerendering needs a Chromium binary and a reachable API at build time:

```bash
CHROME_BIN=/usr/bin/chromium API_URL=http://localhost:5000/api npm run build -w frontend
```

If Chromium is absent the step is skipped with a warning (the SPA still works;
crawlers just receive the shell), so a bare CI runner will not fail the build.

## Deployment

The application is designed to run with **PGlite** (embedded PostgreSQL in the browser/node), so no external database is required for development. For production, replace the `DATABASE_URL` with a managed PostgreSQL connection string.

---

Built with modern fullstack practices — TypeScript throughout, API-first with OpenAPI/orval, shadcn-ui components, and proper env hygiene.

