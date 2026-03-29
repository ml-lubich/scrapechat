import { NextResponse } from "next/server";
import OpenAI from "openai";

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

const SYSTEM_PROMPT = `You are ScrapeChatAI, an expert web scraping assistant. When a user describes what they want to scrape, you:

1. Generate a Playwright script that scrapes the requested data
2. Generate a Zod schema that validates the scraped data
3. Provide a helpful response message

IMPORTANT RULES:
- The Playwright script should be a complete, runnable Node.js script
- Use page.goto() with the provided URL
- Use appropriate selectors (prefer data attributes, then semantic HTML, then CSS classes)
- Handle loading states with waitForSelector or waitForLoadState
- The script should output JSON to stdout via console.log(JSON.stringify(results))
- The Zod schema should match the expected output structure
- If no URL is provided, ask the user for one
- Handle pagination if the user asks for it

Respond with a JSON object with these fields:
- message: A friendly response explaining what you'll do (string)
- script: The complete Playwright script (string)
- schema: The Zod schema definition (string)
- url: The target URL extracted from the user's message (string or null)

ONLY respond with valid JSON. No markdown, no code fences.`;

export async function POST(request: Request) {
  try {
    const { message } = await request.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OpenAI API key not configured" },
        { status: 500 }
      );
    }

    const completion = await getOpenAI().chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: message },
      ],
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

    const data = JSON.parse(responseText);

    return NextResponse.json({
      message: data.message,
      script: data.script,
      schema: data.schema,
      url: data.url,
      results: null,
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
