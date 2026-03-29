import { NextResponse } from "next/server";

export async function GET() {
  const checks: Record<string, boolean> = {
    supabase_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabase_key: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    openai_key: !!process.env.OPENAI_API_KEY,
    stripe_key: !!process.env.STRIPE_SECRET_KEY,
  };

  const healthy = checks.supabase_url && checks.supabase_key && checks.openai_key;

  return NextResponse.json(
    {
      status: healthy ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      checks,
    },
    { status: healthy ? 200 : 503 }
  );
}
