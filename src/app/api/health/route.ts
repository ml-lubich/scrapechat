import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_TIMEOUT_MS = 5000;

interface HealthCheck {
  status: "pass" | "fail";
  message: string;
  duration_ms?: number;
}

export async function GET() {
  const checks: Record<string, HealthCheck> = {};

  // Check required env vars
  const requiredEnvVars: Record<string, string | undefined> = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  };

  const missingVars = Object.entries(requiredEnvVars)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  checks.env_vars = missingVars.length === 0
    ? { status: "pass", message: "All required environment variables configured" }
    : { status: "fail", message: `Missing: ${missingVars.join(", ")}` };

  // Check Supabase connectivity
  checks.supabase_connection = await checkSupabaseConnection();

  // Determine overall status
  const allPass = Object.values(checks).every((c) => c.status === "pass");
  const allFail = Object.values(checks).every((c) => c.status === "fail");
  const overallStatus = allPass ? "healthy" : allFail ? "unhealthy" : "degraded";

  return NextResponse.json(
    {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      checks,
    },
    { status: overallStatus === "healthy" ? 200 : 503 }
  );
}

async function checkSupabaseConnection(): Promise<HealthCheck> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return { status: "fail", message: "Supabase credentials not configured" };
  }

  const start = Date.now();

  try {
    const supabase = createClient(url, key);

    const result = await Promise.race([
      supabase.from("scrape_jobs").select("id", { count: "exact", head: true }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Supabase health check timed out")), SUPABASE_TIMEOUT_MS)
      ),
    ]);

    const duration_ms = Date.now() - start;

    if (result.error) {
      return { status: "fail", message: result.error.message, duration_ms };
    }

    return { status: "pass", message: "Connected", duration_ms };
  } catch (error) {
    const duration_ms = Date.now() - start;
    const message = error instanceof Error ? error.message : "Unknown error";
    return { status: "fail", message, duration_ms };
  }
}
