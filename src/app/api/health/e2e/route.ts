import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const TIMEOUT_MS = 5000;

interface E2ECheck {
  status: "pass" | "fail";
  message: string;
  duration_ms: number;
}

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        checks: {},
        error: "Supabase credentials not configured",
      },
      { status: 503 }
    );
  }

  const [readCheck, authCheck] = await Promise.all([
    checkSupabaseRead(url, key),
    checkSupabaseAuth(url),
  ]);

  const checks: Record<string, E2ECheck> = {
    supabase_read: readCheck,
    supabase_auth: authCheck,
  };

  const allPass = Object.values(checks).every((c) => c.status === "pass");

  return NextResponse.json(
    {
      status: allPass ? "healthy" : "unhealthy",
      timestamp: new Date().toISOString(),
      checks,
    },
    { status: allPass ? 200 : 503 }
  );
}

async function checkSupabaseRead(url: string, key: string): Promise<E2ECheck> {
  const start = Date.now();
  try {
    const supabase = createClient(url, key);
    const result = await Promise.race([
      supabase.from("scrape_jobs").select("id", { count: "exact", head: true }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Read check timed out")), TIMEOUT_MS)
      ),
    ]);

    const duration_ms = Date.now() - start;

    if (result.error) {
      return { status: "fail", message: result.error.message, duration_ms };
    }

    return { status: "pass", message: "Read query succeeded", duration_ms };
  } catch (error) {
    const duration_ms = Date.now() - start;
    const message = error instanceof Error ? error.message : "Unknown error";
    return { status: "fail", message, duration_ms };
  }
}

async function checkSupabaseAuth(supabaseUrl: string): Promise<E2ECheck> {
  const start = Date.now();
  try {
    const response = await Promise.race([
      fetch(`${supabaseUrl}/auth/v1/health`, {
        headers: { Accept: "application/json" },
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Auth check timed out")), TIMEOUT_MS)
      ),
    ]);

    const duration_ms = Date.now() - start;

    if (!response.ok) {
      return { status: "fail", message: `Auth endpoint returned ${response.status}`, duration_ms };
    }

    return { status: "pass", message: "Auth service reachable", duration_ms };
  } catch (error) {
    const duration_ms = Date.now() - start;
    const message = error instanceof Error ? error.message : "Unknown error";
    return { status: "fail", message, duration_ms };
  }
}
