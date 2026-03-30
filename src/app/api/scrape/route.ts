import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

const FREE_TIER_LIMIT = 50;

const SYSTEM_PROMPT = `You are ScrapeChatAI, an expert web scraping assistant. When a user describes what they want to scrape, you:

1. Generate a Playwright script that scrapes the requested data
2. Generate a Zod schema that validates the scraped data
3. Provide a helpful response message
4. Generate realistic sample results showing what the scraper would return

IMPORTANT RULES:
- The Playwright script should be a complete, runnable Node.js script
- Use page.goto() with the provided URL
- Use appropriate selectors (prefer data attributes, then semantic HTML, then CSS classes)
- Handle loading states with waitForSelector or waitForLoadState
- The script should output JSON to stdout via console.log(JSON.stringify(results))
- The Zod schema should match the expected output structure
- If no URL is provided, ask the user for one in the message field, and set script/schema/results to null
- Handle pagination if the user asks for it
- Generate 5-10 realistic sample results showing the data structure

Respond with a JSON object with these fields:
- message: A friendly response explaining what you'll do (string)
- script: The complete Playwright script (string, or null if no URL)
- schema: The Zod schema definition (string, or null if no URL)
- url: The target URL extracted from the user's message (string or null)
- results: An array of sample result objects matching the schema (array or null if no URL)

ONLY respond with valid JSON. No markdown, no code fences.`;

export async function POST(request: Request) {
  try {
    // Auth check
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check usage limits
    const { data: profile } = await supabase
      .from("profiles")
      .select("subscription_tier, scrape_count_this_month")
      .eq("id", user.id)
      .single();

    if (profile && profile.subscription_tier === "free" && profile.scrape_count_this_month >= FREE_TIER_LIMIT) {
      return NextResponse.json(
        { error: "Monthly scrape limit reached. Upgrade to Pro for unlimited scrapes." },
        { status: 429 }
      );
    }

    const { message, history } = await request.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const MAX_MESSAGE_LENGTH = 2000;
    if (message.length > MAX_MESSAGE_LENGTH) {
      return NextResponse.json(
        { error: `Message too long. Maximum ${MAX_MESSAGE_LENGTH} characters.` },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    // Build messages array with optional conversation history
    const chatMessages: { role: "system" | "user" | "assistant"; content: string }[] = [
      { role: "system", content: SYSTEM_PROMPT },
    ];

    if (Array.isArray(history)) {
      for (const msg of history) {
        if (msg.role === "user" || msg.role === "assistant") {
          chatMessages.push({ role: msg.role, content: String(msg.content) });
        }
      }
    }

    chatMessages.push({ role: "user", content: message });

    const completion = await getOpenAI().chat.completions.create({
      model: "gpt-4o",
      messages: chatMessages,
      temperature: 0.2,
      response_format: { type: "json_object" },
    });

    const responseText = completion.choices[0]?.message?.content;
    if (!responseText) {
      return NextResponse.json(
        { error: "No response from AI" },
        { status: 500 }
      );
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      console.error("Invalid JSON from AI response:", responseText);
      return NextResponse.json(
        { error: "Failed to parse AI response. Please try again." },
        { status: 502 }
      );
    }

    const results = Array.isArray(data.results) ? data.results : null;
    const itemsCount = results ? results.length : 0;

    // Save scrape job to database
    await supabase.from("scrape_jobs").insert({
      user_id: user.id,
      message,
      url: data.url || null,
      status: "complete",
      ai_response: data.message,
      generated_script: data.script || null,
      zod_schema: data.schema || null,
      results: results,
      items_count: itemsCount,
    });

    // Increment usage counter
    await supabase.rpc("increment_scrape_count", { user_id_param: user.id }).maybeSingle();
    // Fallback if RPC doesn't exist yet
    if (profile) {
      await supabase
        .from("profiles")
        .update({ scrape_count_this_month: (profile.scrape_count_this_month || 0) + 1 })
        .eq("id", user.id);
    }

    return NextResponse.json({
      message: data.message,
      script: data.script || null,
      schema: data.schema || null,
      url: data.url || null,
      results: results
        ? { data: results, itemsCount }
        : null,
    });
  } catch (err) {
    console.error("Scrape API error:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Failed to generate script",
      },
      { status: 500 }
    );
  }
}
