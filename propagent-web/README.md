# agent-loop Web Frontend

Next.js 16 frontend for agent-loop real estate platform - South Africa.

## Tech Stack

- **Framework**: Next.js 16.2.1 (App Router)
- **UI**: React 19 + Tailwind CSS 4
- **Language**: TypeScript
- **Database**: Supabase (connected)
- **AI Services**: Groq API (ready to configure)

## Project Structure

```
agentloop-web/
├── src/
│   ├── app/                    # App router pages (18 pages)
│   │   ├── page.tsx            # Landing page
│   │   └── layout.tsx         # Root layout
│   ├── components/
│   │   ├── ui/                # Reusable UI components
│   │   ├── tools/              # AI tool components (11 tools)
│   │   └── index.ts           # Component exports
│   ├── hooks/                  # Custom React hooks
│   │   ├── useTheme.ts        # Theme switching
│   │   └── index.ts
│   ├── lib/
│   │   ├── supabase.ts        # Database client
│   │   ├── auth.tsx            # Authentication
│   │   ├── valuations.ts       # Property valuations
│   │   ├── matching.ts        # Tenant matching
│   │   ├── leads.ts           # Lead management
│   │   ├── financials.ts       # Financial calculations
│   │   ├── syndication.ts     # Property syndication
│   │   └── *.ts               # Various utilities
│   └── types/
│       ├── property.ts
│       └── images.ts
├── public/                     # Static assets
├── package.json
├── next.config.ts
├── tsconfig.json
├── CLAUDE.md                   # Agent rules
└── AGENTS.md                   # Agent configuration
```

## Features Implemented

- Dashboard with KPIs
- Property listings management
- Tenant database (CRM)
- Lead pipeline
- AI-powered tools (11 integrated)
- Property valuations
- Tenant screening
- Viewing scheduler
- Financial calculations
- Document management
- Communication platform
- Trust accounting (UI ready)
- Market reports

## Getting Started

```bash
cd agentloop-web
npm install
npm run dev
```

Access: http://localhost:3000

## Environment Variables

Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## Deployment

Already deployed on Vercel - see main project README for status.

## Status (Updated: 2026-04-15)

- **18 pages** implemented
- **11 AI tools** integrated
- **Supabase** connected
- **Live** on Vercel