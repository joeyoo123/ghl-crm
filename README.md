# GHL CRM

An open-source recreation of [Go High Level](https://www.gohighlevel.com/) -- the all-in-one sales and marketing platform for small businesses. Built with Next.js, Prisma, and OpenAI.

**Live Demo:** [https://ghl-crm-iota.vercel.app](https://ghl-crm-iota.vercel.app)

---

## Features

### Core CRM
- **Dashboard** -- Business metrics at a glance: contacts, revenue, pipeline value, open deals, active conversations, appointments, missed calls, and AI status.
- **Contacts** -- Full contact management with create, search, filter by status (lead, prospect, customer, inactive), and source tracking.
- **Pipelines** -- Kanban board view with configurable stages. Create multiple pipelines, add deals, and move them across stages (New Lead → Contacted → Qualified → Proposal Sent → Negotiation → Closed Won/Lost).
- **Calendar** -- Month and list views. Schedule appointments linked to contacts with location and status tracking.
- **Automations** -- Workflow engine with configurable triggers (missed call, new lead, deal stage change, appointment reminder, form submission) and actions (AI reply, send SMS, send email, notify, create task).
- **Settings** -- Configure business info, AI tone, missed call auto-reply behavior, and notification preferences.

### AI Conversation Agent
The flagship feature -- an AI-powered conversation system that handles customer communications automatically:

- **Missed Call Text-Back** -- When a call is missed, the AI agent automatically sends a personalized SMS or email follow-up.
- **Multi-Channel Inbox** -- Unified view of all conversations across SMS, email, and live chat.
- **AI Auto-Reply** -- Toggle per conversation. When enabled, every inbound message triggers a real-time AI response using OpenAI.
- **AI Agent Test Lab** -- A dedicated page (`/ai-test`) where you can chat as a customer and see the AI agent respond in real time. Pick a contact persona, choose a channel (SMS/email/chat), and have a full back-and-forth conversation.
- **Conversation History** -- The AI uses the full conversation context to generate relevant, contextual responses.
- **Fallback Responses** -- Graceful degradation when OpenAI is unavailable.

### How the AI Works
1. A customer message comes in (or is simulated via the test lab)
2. The message is saved to the database as an inbound message
3. The full conversation history is loaded and sent to OpenAI (gpt-4o-mini)
4. The AI generates a contextual response based on the channel, trigger type, and conversation history
5. The AI response is saved to the database and returned to the UI in real time

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js 16](https://nextjs.org/) (App Router, Server Components) |
| Language | TypeScript |
| Database | PostgreSQL via [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres) (Neon) |
| ORM | [Prisma 7](https://www.prisma.io/) with `@prisma/adapter-neon` |
| Styling | [Tailwind CSS v4](https://tailwindcss.com/) |
| AI | [OpenAI](https://openai.com/) (gpt-4o-mini) |
| Icons | [Lucide React](https://lucide.dev/) |
| Deployment | [Vercel](https://vercel.com/) |

---

## Getting Started

### Prerequisites
- Node.js 20+
- A PostgreSQL database (or use SQLite locally by swapping the adapter)
- An OpenAI API key (optional -- fallback responses work without it)

### Setup

```bash
# Clone the repo
git clone https://github.com/joeyoo123/ghl-crm.git
cd ghl-crm

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database URL and OpenAI API key

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Seed the database with demo data
npx tsx prisma/seed.ts

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `POSTGRES_PRISMA_URL` | Vercel Postgres pooled connection (used if set) | No |
| `OPENAI_API_KEY` | OpenAI API key for AI conversation features | No* |
| `NEXTAUTH_SECRET` | Auth secret (for future auth implementation) | No |

\* The app works without an OpenAI key using built-in fallback responses, but the AI agent test lab and auto-reply features require it for real AI responses.

---

## Project Structure

```
src/
├── app/
│   ├── (dashboard)/          # All dashboard pages (layout with sidebar)
│   │   ├── page.tsx          # Dashboard home
│   │   ├── ai-test/          # AI Agent Test Lab
│   │   ├── contacts/         # Contact management
│   │   ├── pipelines/        # Pipeline/deals Kanban board
│   │   ├── conversations/    # Multi-channel inbox
│   │   ├── calendar/         # Appointment scheduling
│   │   ├── automations/      # Workflow automation
│   │   └── settings/         # App configuration
│   └── api/
│       ├── contacts/         # Contact CRUD
│       ├── pipelines/        # Pipeline CRUD
│       ├── deals/            # Deal management
│       ├── conversations/    # Conversations + AI auto-reply
│       │   ├── route.ts      # CRUD + missed call simulation
│       │   ├── ai/           # AI response generation
│       │   └── reply/        # AI test lab endpoint (inbound → AI → outbound)
│       ├── calendar/         # Appointment CRUD
│       ├── automations/      # Automation CRUD
│       └── dashboard/        # Dashboard stats
├── components/
│   ├── ui/                   # Reusable UI primitives
│   ├── layout/               # Sidebar, navigation
│   ├── contacts/             # Contact list component
│   ├── pipelines/            # Pipeline board component
│   ├── conversations/        # Conversation view + AI test chat
│   ├── calendar/             # Calendar view component
│   └── automations/          # Automation list component
├── lib/
│   ├── ai.ts                 # OpenAI integration + fallback responses
│   ├── auth.ts               # Auth helpers
│   ├── prisma.ts             # Prisma client singleton
│   └── utils.ts              # Shared utilities
└── types/
    └── index.ts              # Shared TypeScript types
```

---

## Deployment

The app is deployed on Vercel with Vercel Postgres (Neon).

```bash
# Link to Vercel
vercel link

# Add Neon Postgres
vercel install neon

# Deploy
vercel --prod
```

Set `OPENAI_API_KEY` in your Vercel project's environment variables to enable AI features in production.

---

## License

MIT
