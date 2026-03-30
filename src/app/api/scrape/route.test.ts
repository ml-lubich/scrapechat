import { describe, it, expect, vi, beforeEach } from "vitest";

// --- Mocks ---

const mockGetUser = vi.fn();
const mockFrom = vi.fn();
const mockRpc = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser: mockGetUser },
    from: mockFrom,
    rpc: mockRpc,
  })),
}));

const mockCreate = vi.fn();

vi.mock("openai", () => ({
  default: class {
    chat = { completions: { create: mockCreate } };
  },
}));

// --- Helpers ---

function makeRequest(body: unknown) {
  return new Request("http://localhost/api/scrape", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const fakeUser = { id: "user-123" };

const fakeProfile = {
  subscription_tier: "free",
  scrape_count_this_month: 5,
};

const fakeAiResponse = {
  message: "I'll scrape that for you!",
  script: "const { chromium } = require('playwright');",
  schema: "z.object({ title: z.string() })",
  url: "https://example.com",
  results: [{ title: "Example" }],
};

function setupAuthenticatedUser(profile = fakeProfile) {
  mockGetUser.mockResolvedValue({ data: { user: fakeUser }, error: null });
  mockFrom.mockImplementation((table: string) => {
    if (table === "profiles") {
      return {
        select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: profile }) }) }),
        update: () => ({ eq: () => Promise.resolve({}) }),
      };
    }
    if (table === "scrape_jobs") {
      return { insert: () => Promise.resolve({}) };
    }
    return {};
  });
  mockRpc.mockReturnValue({ maybeSingle: () => Promise.resolve({}) });
}

// --- Tests ---

describe("POST /api/scrape", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.OPENAI_API_KEY = "sk-test";
  });

  async function callScrape(body: unknown) {
    const { POST } = await import("./route");
    const response = await POST(makeRequest(body));
    return { status: response.status, body: await response.json() };
  }

  describe("authentication", () => {
    it("returns 401 when user is not authenticated", async () => {
      mockGetUser.mockResolvedValue({ data: { user: null }, error: { message: "Not authenticated" } });

      const { status, body } = await callScrape({ message: "scrape something" });

      expect(status).toBe(401);
      expect(body.error).toBe("Unauthorized");
    });
  });

  describe("input validation", () => {
    beforeEach(() => setupAuthenticatedUser());

    it("returns 400 when message is missing", async () => {
      const { status, body } = await callScrape({});

      expect(status).toBe(400);
      expect(body.error).toBe("Message is required");
    });

    it("returns 400 when message is not a string", async () => {
      const { status, body } = await callScrape({ message: 42 });

      expect(status).toBe(400);
      expect(body.error).toBe("Message is required");
    });

    it("returns 400 when message is empty string", async () => {
      const { status, body } = await callScrape({ message: "" });

      expect(status).toBe(400);
      expect(body.error).toBe("Message is required");
    });

    it("returns 400 when message exceeds 2000 characters", async () => {
      const { status, body } = await callScrape({ message: "a".repeat(2001) });

      expect(status).toBe(400);
      expect(body.error).toContain("Message too long");
    });
  });

  describe("usage limits", () => {
    it("returns 429 when free-tier user exceeds limit", async () => {
      setupAuthenticatedUser({ subscription_tier: "free", scrape_count_this_month: 50 });

      const { status, body } = await callScrape({ message: "scrape something" });

      expect(status).toBe(429);
      expect(body.error).toContain("Monthly scrape limit reached");
    });

    it("allows pro-tier users past the free limit", async () => {
      setupAuthenticatedUser({ subscription_tier: "pro", scrape_count_this_month: 100 });
      mockCreate.mockResolvedValue({
        choices: [{ message: { content: JSON.stringify(fakeAiResponse) } }],
      });

      const { status } = await callScrape({ message: "scrape something" });

      expect(status).toBe(200);
    });
  });

  describe("OpenAI integration", () => {
    beforeEach(() => setupAuthenticatedUser());

    it("returns 500 when OPENAI_API_KEY is missing", async () => {
      delete process.env.OPENAI_API_KEY;

      const { status, body } = await callScrape({ message: "scrape something" });

      expect(status).toBe(500);
      expect(body.error).toBe("OpenAI API key not configured");
    });

    it("returns 500 when AI returns empty response", async () => {
      mockCreate.mockResolvedValue({
        choices: [{ message: { content: null } }],
      });

      const { status, body } = await callScrape({ message: "scrape something" });

      expect(status).toBe(500);
      expect(body.error).toBe("No response from AI");
    });

    it("returns 502 when AI returns invalid JSON", async () => {
      mockCreate.mockResolvedValue({
        choices: [{ message: { content: "not json" } }],
      });

      const { status, body } = await callScrape({ message: "scrape something" });

      expect(status).toBe(502);
      expect(body.error).toContain("Failed to parse AI response");
    });
  });

  describe("successful scrape", () => {
    beforeEach(() => {
      setupAuthenticatedUser();
      mockCreate.mockResolvedValue({
        choices: [{ message: { content: JSON.stringify(fakeAiResponse) } }],
      });
    });

    it("returns structured response with script, schema, and results", async () => {
      const { status, body } = await callScrape({ message: "scrape example.com for titles" });

      expect(status).toBe(200);
      expect(body.message).toBe(fakeAiResponse.message);
      expect(body.script).toBe(fakeAiResponse.script);
      expect(body.schema).toBe(fakeAiResponse.schema);
      expect(body.url).toBe(fakeAiResponse.url);
      expect(body.results.data).toEqual(fakeAiResponse.results);
      expect(body.results.itemsCount).toBe(1);
    });

    it("saves scrape job to database", async () => {
      await callScrape({ message: "scrape example.com" });

      expect(mockFrom).toHaveBeenCalledWith("scrape_jobs");
    });

    it("passes conversation history to OpenAI", async () => {
      const history = [
        { role: "user", content: "scrape example.com" },
        { role: "assistant", content: '{"message": "OK"}' },
      ];

      await callScrape({ message: "now get prices too", history });

      const callArgs = mockCreate.mock.calls[0][0];
      // system + 2 history + 1 current message
      expect(callArgs.messages).toHaveLength(4);
      expect(callArgs.messages[0].role).toBe("system");
      expect(callArgs.messages[1].content).toBe("scrape example.com");
      expect(callArgs.messages[3].content).toBe("now get prices too");
    });
  });
});
