# ScrapeChatAI — Bug & Audit Report

Full audit performed on 2026-03-29. Every source file read and analyzed.

---

## CRITICAL — App-Breaking Issues

### BUG-001: No actual scraping occurs
- **Location**: `src/app/api/scrape/route.ts:75`
- **Problem**: API returns `results: null` always. No Playwright execution exists anywhere.
- **Impact**: Core feature is non-functional. The app generates scripts but never runs them.
- **Fix**: For Vercel deployment, actual Playwright execution is impractical (no headless browser in serverless). The API should return simulated/structured results from OpenAI directly, or integrate a scraping service.

### BUG-002: No database tables exist
- **Location**: No `supabase/migrations/` directory
- **Problem**: No SQL migrations, no tables for scrape_jobs, recipes, or user profiles.
- **Impact**: Recipes page is empty shell, settings has hardcoded data, no usage tracking.
- **Fix**: Create migration files with all required tables + RLS policies.

### BUG-003: Recipes page is UI-only
- **Location**: `src/app/recipes/page.tsx:19`
- **Problem**: `useState<Recipe[]>([])` — hardcoded empty array. No database queries. Run/Delete buttons are non-functional.
- **Impact**: Feature is completely broken.
- **Fix**: Integrate Supabase queries to load/save/delete recipes.

### BUG-004: Settings page is all hardcoded
- **Location**: `src/app/settings/page.tsx:30-45`
- **Problem**: Plan shows "Free" hardcoded. Usage shows "0 / 50 scrapes" hardcoded. "Upgrade to Pro" button does nothing.
- **Impact**: No real user data displayed, no billing integration.
- **Fix**: Fetch user profile + usage from Supabase, add Stripe for billing.

### BUG-005: No Stripe integration
- **Problem**: Pricing page shows $29/mo Pro plan but no Stripe checkout, no webhooks, no subscription management.
- **Impact**: Cannot monetize, upgrade button is dead.
- **Fix**: Add Stripe Checkout, webhook handler, customer portal, subscription gating.

---

## HIGH — Functional Issues

### BUG-006: Chat messages not persisted
- **Location**: `src/app/chat/page.tsx:11`
- **Problem**: Messages live in React state only. Page refresh = all messages lost. Sidebar shows "No conversations yet" always.
- **Fix**: Save scrape jobs to Supabase, load conversation history.

### BUG-007: /api/scrape has no auth check
- **Location**: `src/app/api/scrape/route.ts:32`
- **Problem**: API route doesn't verify the user is authenticated. Anyone can call it.
- **Fix**: Add Supabase server client auth check at start of handler.

### BUG-008: No usage tracking or rate limiting
- **Problem**: Free tier advertises "50 scrapes/month" but nothing tracks or enforces this.
- **Fix**: Track scrape count in database, enforce limits in API route.

### BUG-009: "New Chat" button is non-functional
- **Location**: `src/components/chat/chat-sidebar.tsx:67-70`
- **Problem**: Button renders but has no onClick handler.
- **Fix**: Clear messages state or navigate to fresh chat.

### BUG-010: "Save Recipe" never appears in chat
- **Location**: `src/app/chat/page.tsx:129`
- **Problem**: `ChatMessage` component accepts `onSaveRecipe` prop but chat page never passes it.
- **Fix**: Pass save handler from chat page to message component.

---

## MEDIUM — Missing Infrastructure

### BUG-011: No error boundary
- **Problem**: No React error boundary. Unhandled errors crash the entire app.
- **Fix**: Add error.tsx files for app router error handling.

### BUG-012: No loading states for pages
- **Problem**: No loading.tsx files. Pages show blank while loading.
- **Fix**: Add loading.tsx with skeleton UI.

### BUG-013: No 404 page
- **Problem**: Missing `not-found.tsx`. Invalid routes show default Next.js 404.
- **Fix**: Add branded not-found page.

### BUG-014: No /api/health endpoint
- **Problem**: No health check for monitoring.
- **Fix**: Add GET /api/health returning service status.

### BUG-015: No env var validation at startup
- **Problem**: App uses `process.env.X!` with non-null assertions. Missing vars cause runtime crashes with unhelpful errors.
- **Fix**: Add env validation (e.g., Zod schema) in a shared config module.

### BUG-016: .env.example is incomplete
- **Location**: `.env.local.example`
- **Problem**: Missing Stripe keys, missing NEXT_PUBLIC_APP_URL.
- **Fix**: Add all required env vars.

---

## LOW — Polish Issues

### BUG-017: Button variant "icon-xs" may not exist
- **Location**: `src/components/chat/chat-message.tsx:83`
- **Problem**: Uses `size="icon-xs"` but button component may not define this variant.
- **Fix**: Verify button variants, add if missing.

### BUG-018: IMPLEMENTATION_PLAN.md claims all iterations complete
- **Location**: `IMPLEMENTATION_PLAN.md`
- **Problem**: All 7 iterations marked [x] but most features are non-functional (recipes, settings, results display).
- **Fix**: Update to reflect actual status after validation.

### BUG-019: No favicon or OG image
- **Problem**: No custom favicon, no Open Graph meta tags for social sharing.
- **Fix**: Add favicon and OG tags.

---

## Summary

| Severity | Count |
|----------|-------|
| Critical | 5     |
| High     | 5     |
| Medium   | 6     |
| Low      | 3     |
| **Total** | **19** |
