# ScrapeChatAI — LLM-Powered Web Scraper You Chat With

## Overview
A conversational web scraping tool. You tell it what you want to scrape in plain English, it writes Playwright scripts, runs them, validates the output with Pydantic schemas, and returns structured data.

## Core Features

### 1. Chat Interface
- Clean chat UI where users describe what they want to scrape
- "Scrape all restaurant names and phone numbers from this Yelp page"
- "Get all product prices from this Amazon search"
- Conversational — ask follow-ups, refine, iterate

### 2. AI Script Generation
- LLM generates Playwright scripts based on user description
- Shows the generated script to the user (transparency)
- User can approve, edit, or regenerate
- Handles pagination, infinite scroll, login-required sites

### 3. Pydantic Validation
- AI generates Pydantic models for the expected output
- All scraped data is validated against the schema
- Shows validation errors clearly
- User can adjust schema

### 4. Execution & Results
- Runs Playwright scripts in sandboxed environment
- Real-time progress (pages scraped, items found)
- Export to JSON, CSV, or clipboard
- Save scraping "recipes" for re-use

### 5. Auth & Billing
- Google OAuth via Supabase
- Free tier: 50 scrapes/month
- Pro: $29/month unlimited
- Usage tracking

## Tech Stack
- **Framework**: Next.js 14+ (App Router)
- **Database**: Supabase
- **Styling**: Tailwind CSS + shadcn/ui
- **AI**: OpenAI GPT-4o for script generation
- **Scraping**: Playwright (server-side)
- **Validation**: Zod (TypeScript equivalent of Pydantic)
- **Deployment**: Vercel
- **Language**: TypeScript

## Database Schema

### users (via Supabase Auth)

### scrape_jobs
- id, user_id, description, url, status (pending/running/complete/failed)
- generated_script (text), schema_definition (jsonb)
- results (jsonb), items_count (int)
- created_at, completed_at

### recipes
- id, user_id, name, description, url_pattern
- script_template, schema_definition
- times_used (int), created_at

## Pages
- `/` — Landing page
- `/login` — Auth
- `/chat` — Main scraping chat interface
- `/recipes` — Saved scraping recipes
- `/settings` — Account & billing

## MVP Scope
1. Landing page
2. Google OAuth login
3. Chat interface with scraping conversation
4. AI generates Playwright script + Zod schema
5. Execute script and show results
6. Export to JSON/CSV
7. Save as recipe
