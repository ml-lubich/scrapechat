# CLAUDE.md — ScrapeChatAI

## Project Overview
ScrapeChatAI is a conversational web scraping tool. Users describe what they want to scrape in plain English, the AI generates Playwright scripts + Zod validation schemas, executes them, and returns structured data.

## Tech Stack
- **Framework**: Next.js 16 (App Router, TypeScript)
- **Database**: Supabase (Postgres + Auth + Realtime)
- **Auth**: Supabase Google OAuth
- **AI**: OpenAI GPT-4o (script generation + schema inference)
- **Scraping**: Playwright (server-side execution)
- **Validation**: Zod (runtime schema validation)
- **Payments**: Stripe (checkout + customer portal + webhooks)
- **Styling**: Tailwind CSS + shadcn/ui
- **Deployment**: Vercel

## Architecture
```
src/
├── app/
│   ├── api/
│   │   ├── scrape/        # POST — generate + execute scraping
│   │   ├── webhooks/      # Stripe webhooks
│   │   └── health/        # Health check
│   ├── chat/              # Main scraping chat interface
│   ├── recipes/           # Saved scraping recipes
│   ├── settings/          # Account + billing
│   ├── auth/              # OAuth callback
│   └── login/             # Login page
├── components/
│   └── ui/               # shadcn/ui primitives
├── lib/
│   ├── supabase.ts
│   ├── supabase-server.ts
│   ├── openai.ts         # OpenAI client + prompt templates
│   └── utils.ts
└── types/
```

## Coding Standards (Uncle Bob's Clean Code)
1. **Single Responsibility** — One function, one job
2. **Meaningful Names** — `generatePlaywrightScript` not `generate`
3. **Small Functions** — Extract. Extract. Extract.
4. **No Magic Numbers** — `FREE_TIER_SCRAPES = 50`
5. **Error Handling** — Try/catch with meaningful error messages
6. **DRY** — Shared prompt templates, shared Supabase queries
7. **Clean Imports** — Grouped and ordered
8. **Type Safety** — Full TypeScript, no `any`
9. **Separation of Concerns** — API logic in lib/, UI in components/
10. **Fail Gracefully** — Show users helpful error messages, never raw stack traces

## Environment Variables
See `.env.example`. Never hardcode.

## Database
Supabase with RLS. Tables: scrape_jobs, recipes, user_settings.
All queries scoped to authenticated user via RLS.

## Key Decisions
- Chat-first UX (not form-based)
- Show generated scripts for transparency
- Zod for runtime validation of scraped data
- Recipes = saved scraping configurations for re-use
- Stripe Checkout for billing (KISS)
