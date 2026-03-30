/** Business logic constants — single source of truth */

export const FREE_TIER_LIMIT = 50;
export const MAX_MESSAGE_LENGTH = 2000;
export const HISTORY_LIMIT = 20;
export const CONTEXT_MESSAGE_LIMIT = 6;

/** Rate limiting */
export const SCRAPE_RATE_LIMIT_MAX = 10;
export const SCRAPE_RATE_LIMIT_WINDOW_MS = 60_000;

/** History validation */
export const MAX_HISTORY_ITEMS = 20;
export const MAX_HISTORY_CONTENT_LENGTH = 5000;

/** OpenAI request timeout (ms) */
export const OPENAI_TIMEOUT_MS = 30_000;
