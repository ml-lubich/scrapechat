# ScrapeChatAI

LLM-powered web scraper you chat with. Describe what you want to scrape in plain English -- ScrapeChatAI generates Playwright scripts, validates output with Zod schemas, and returns clean structured data.

## Features

- **Chat-based scraping** -- describe what you want in natural language
- **AI script generation** -- GPT-4o writes Playwright scripts for any site
- **Schema validation** -- Zod schemas validate every piece of scraped data
- **Export** -- download results as JSON or CSV
- **Reusable recipes** -- save scraping workflows for one-click re-runs
- **Dark/light mode** -- system-aware theme with manual toggle
- **Mobile responsive** -- works on any device

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Auth**: Supabase (Google OAuth)
- **AI**: OpenAI GPT-4o
- **Scraping**: Playwright
- **Validation**: Zod

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project with Google OAuth configured
- An OpenAI API key

### Setup

1. Clone the repository:

```bash
git clone <repo-url>
cd scrapechat
```

2. Install dependencies:

```bash
npm install
```

3. Copy the environment file and fill in your keys:

```bash
cp .env.local.example .env.local
```

Required environment variables:
- `NEXT_PUBLIC_SUPABASE_URL` -- your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` -- your Supabase anon/public key
- `OPENAI_API_KEY` -- your OpenAI API key

4. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
  app/
    page.tsx          # Landing page
    login/            # Google OAuth login
    chat/             # Main scraping chat interface
    recipes/          # Saved scraping recipes
    settings/         # Account & billing
    api/scrape/       # AI script generation endpoint
    auth/callback/    # OAuth callback handler
  components/
    chat/             # Chat UI components
    ui/               # shadcn/ui components
    navbar.tsx        # Landing page navbar
    theme-toggle.tsx  # Dark/light mode toggle
  lib/
    supabase/         # Supabase client (browser, server, middleware)
    utils.ts          # Utility functions
  types/
    chat.ts           # TypeScript types for chat
```

## License

MIT
