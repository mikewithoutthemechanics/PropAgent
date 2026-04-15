# PropAgent Web - Development Guide

## Project Overview

**Stack**: Next.js 16.2.1 + React 19 + Tailwind 4 + TypeScript + Supabase
**Status**: Deployed on Vercel
**Database**: Supabase (sehweutpfftnrcbqshsn.supabase.co)

## Key Files

- `.env.local` - Environment variables (already configured)
- `src/app/` - Next.js App Router pages
- `src/components/` - React components
- `src/lib/` - Utilities, services, Supabase client

## Running

```bash
cd propagent-web
npm run dev    # Frontend on localhost:3000
```

## Connected Services

| Service | Config Location | Status |
|---------|----------------|--------|
| Supabase | `.env.local` | ✅ Connected |
| Auth | `src/lib/auth.tsx` | Ready |
| Storage | Supabase bucket | Ready |

## Pages (18 total)

- Dashboard, Properties, Tenants, Leads, Agents
- Calendar, Documents, Maintenance, Financials
- Valuations, Rankings, Chat, Onboarding
- Syndication, Rent AI, Escrow, Matching
- Notifications, Settings, Pricing

## AI Tools (11 total)

In `src/components/tools/`:
- ValuationTool, BondCalculator, MarketComparison
- TenantScreening, PropertyAnalytics
- MaintenanceTracker, ESignatures
- DocumentTemplates, CalendarView
- FinancialReports

## Supabase Connection

```typescript
// Already configured in src/lib/supabase.ts
const supabaseUrl = 'https://sehweutpfftnrcbqshsn.supabase.co'
const supabaseAnonKey = '...' // in .env.local
```
