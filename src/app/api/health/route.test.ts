import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock @supabase/supabase-js before importing the route
vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({
    from: () => ({
      select: () => Promise.resolve({ error: null, count: 0 }),
    }),
  })),
}));

const ENV_VARS = {
  NEXT_PUBLIC_SUPABASE_URL: "https://test.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "test-anon-key",
  OPENAI_API_KEY: "sk-test",
  STRIPE_SECRET_KEY: "sk_test_123",
};

describe("GET /api/health", () => {
  beforeEach(() => {
    vi.resetModules();
    // Set all env vars by default
    for (const [key, value] of Object.entries(ENV_VARS)) {
      process.env[key] = value;
    }
  });

  async function callHealthEndpoint() {
    const { GET } = await import("./route");
    const response = await GET();
    return { status: response.status, body: await response.json() };
  }

  it("returns healthy when all checks pass", async () => {
    const { status, body } = await callHealthEndpoint();

    expect(status).toBe(200);
    expect(body.status).toBe("healthy");
    expect(body.checks.env_vars.status).toBe("pass");
    expect(body.checks.supabase_connection.status).toBe("pass");
    expect(body.timestamp).toBeDefined();
  });

  it("reports missing environment variables", async () => {
    delete process.env.OPENAI_API_KEY;
    delete process.env.STRIPE_SECRET_KEY;

    const { status, body } = await callHealthEndpoint();

    expect(status).toBe(503);
    expect(body.checks.env_vars.status).toBe("fail");
    expect(body.checks.env_vars.message).toContain("OPENAI_API_KEY");
    expect(body.checks.env_vars.message).toContain("STRIPE_SECRET_KEY");
  });

  it("returns degraded when some checks fail", async () => {
    // Missing one env var but Supabase still works
    delete process.env.OPENAI_API_KEY;

    const { status, body } = await callHealthEndpoint();

    expect(status).toBe(503);
    expect(body.status).toBe("degraded");
  });

  it("returns unhealthy when all checks fail", async () => {
    // Remove all env vars
    for (const key of Object.keys(ENV_VARS)) {
      delete process.env[key];
    }

    const { status, body } = await callHealthEndpoint();

    expect(status).toBe(503);
    expect(body.status).toBe("unhealthy");
  });

  it("handles supabase connection failure", async () => {
    vi.doMock("@supabase/supabase-js", () => ({
      createClient: vi.fn(() => ({
        from: () => ({
          select: () => Promise.resolve({ error: { message: "Connection refused" } }),
        }),
      })),
    }));

    const { body } = await callHealthEndpoint();

    expect(body.checks.supabase_connection.status).toBe("fail");
    expect(body.checks.supabase_connection.message).toBe("Connection refused");
    expect(body.checks.supabase_connection.duration_ms).toBeDefined();
  });
});
