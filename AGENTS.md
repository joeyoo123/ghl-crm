# GHL CRM

Go High Level CRM clone -- all-in-one sales & marketing platform with AI conversation features.

## Core Commands

- Dev server: `npm run dev`
- Build (includes prisma generate): `npm run build`
- Generate Prisma client: `npx prisma generate`
- Run migrations: `npx prisma migrate dev`
- Seed database: `npx tsx prisma/seed.ts`
- Deploy to Vercel: `vercel --prod`

Always run `npm run build` to verify compilation before committing.

## Tech Stack

- **Next.js 16** (App Router, Server Components, Turbopack)
- **TypeScript** (strict mode)
- **Prisma 7** with `@prisma/adapter-neon` (PostgreSQL via Vercel Postgres / Neon)
- **Tailwind CSS v4** (imported via `@import "tailwindcss"` in globals.css)
- **OpenAI** (gpt-4o-mini) for AI conversation features
- **Lucide React** for icons

## Project Layout

```
src/
├── app/
│   ├── (dashboard)/       # All pages share sidebar layout
│   │   ├── page.tsx       # Dashboard home
│   │   ├── ai-test/       # AI Agent Test Lab
│   │   ├── contacts/      # Contact management
│   │   ├── pipelines/     # Kanban deal board
│   │   ├── conversations/ # Multi-channel inbox
│   │   ├── calendar/      # Appointments
│   │   ├── automations/   # Workflow engine
│   │   └── settings/      # Configuration
│   └── api/               # API route handlers
├── components/
│   ├── ui/                # Reusable primitives (Button, Card, Input, Modal, etc.)
│   ├── layout/            # Sidebar navigation
│   └── [feature]/         # Feature-specific client components
├── lib/
│   ├── ai.ts              # OpenAI integration + fallback responses
│   ├── auth.ts            # Auth helper (getDefaultUser)
│   ├── prisma.ts          # Prisma client singleton with Neon adapter
│   └── utils.ts           # cn(), formatCurrency, formatDate, getInitials
├── generated/prisma/      # Auto-generated Prisma client (gitignored)
└── types/index.ts         # Shared type definitions
prisma/
├── schema.prisma          # Database schema (PostgreSQL)
├── seed.ts                # Seed data script
└── migrations/            # Prisma migrations
```

## Architecture Patterns

- **Server Components** for pages that fetch data (import `prisma` directly).
- **Client Components** (`"use client"`) for interactive features, receive data via props serialized with `JSON.parse(JSON.stringify(...))`.
- All database pages use `export const dynamic = "force-dynamic"` to prevent build-time DB access.
- API routes live in `src/app/api/[resource]/route.ts` and use `NextRequest`/`NextResponse`.
- The Prisma client is a singleton in `src/lib/prisma.ts` using `@prisma/adapter-neon`.
- Auth uses a simple `getDefaultUser()` helper that returns or creates a default admin user.

## Conventions

- UI components in `src/components/ui/` are unstyled primitives using `cn()` from `@/lib/utils` for class merging.
- Use `lucide-react` for all icons -- never install other icon libraries.
- Tailwind classes only -- no CSS modules or styled-components.
- API routes return `NextResponse.json()`. Always wrap handlers in try/catch.
- JSON fields in the database (tags, stages, actions, customFields) are stored as serialized strings and parsed with `JSON.parse()`.

## AI Conversation System

- `src/lib/ai.ts` is the single entry point for all AI responses.
- `generateAIResponse()` accepts context (contactName, channel, triggerType, conversationHistory) and calls OpenAI.
- Falls back to preset responses if OpenAI is unavailable.
- Three trigger types: `missed_call`, `inquiry`, `follow_up` -- each with a tailored system prompt.
- SMS responses are capped at 100 tokens; email/chat at 500.

## Environment Variables

- `POSTGRES_PRISMA_URL` or `DATABASE_URL` -- PostgreSQL connection string (required)
- `OPENAI_API_KEY` -- enables real AI responses (optional, falls back gracefully)
- Set via `.env.local` locally, Vercel dashboard in production

## Database

- Provider: PostgreSQL (Neon via Vercel Postgres)
- Schema is in `prisma/schema.prisma` -- always run `npx prisma migrate dev` after schema changes
- Prisma 7 requires the adapter pattern -- never use `url` in the datasource block
- The `prisma.config.ts` at repo root handles the connection URL for CLI commands

## Git & Deployment

- Branch from `feature/ghl-crm-v1` for new work
- Run `npm run build` before committing to catch type errors
- Deploy: `vercel --prod` (project is linked to joeyoo123s-projects/ghl-crm)
- PR target: `main` branch
- Vercel auto-deploys from the linked GitHub repo on push

## Gotchas

- Prisma 7 uses `@prisma/adapter-neon` not the old direct URL approach. Never add `url = env("DATABASE_URL")` to `datasource db` in the schema.
- Generated Prisma client lives in `src/generated/prisma/` (gitignored). Import from `@/generated/prisma/client`.
- Tailwind v4 uses `@import "tailwindcss"` not the old `@tailwind` directives.
- The `better-sqlite3` adapter was removed -- this project uses Neon/Postgres only.
- All server-rendered pages must have `export const dynamic = "force-dynamic"` or the build fails trying to query the DB at build time.
