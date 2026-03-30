"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ChatMessage } from "@/components/chat/chat-message";
import { ChatInput } from "@/components/chat/chat-input";
import { ChatSidebar } from "@/components/chat/chat-sidebar";
import { ChatMessage as ChatMessageType } from "@/types/chat";
import { MessageSquare, ShoppingCart, Utensils, Briefcase, Newspaper } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSaveRecipe = useCallback(async (message: ChatMessageType) => {
    if (!message.generatedScript) return;

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const name = message.content.slice(0, 60) + (message.content.length > 60 ? "..." : "");

    await supabase.from("recipes").insert({
      user_id: user.id,
      name,
      description: message.content,
      url_pattern: null,
      script_template: message.generatedScript,
      schema_definition: message.zodSchema || null,
    });
  }, []);

  const handleNewChat = useCallback(() => {
    setMessages([]);
  }, []);

  const handleSend = async (content: string) => {
    const userMessage: ChatMessageType = {
      id: crypto.randomUUID(),
      role: "user",
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    const assistantId = crypto.randomUUID();
    setMessages((prev) => [
      ...prev,
      {
        id: assistantId,
        role: "assistant",
        content: "",
        timestamp: new Date(),
        status: "generating",
      },
    ]);

    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate script");
      }

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantId
            ? {
                ...msg,
                content: data.message,
                status: "complete" as const,
                generatedScript: data.script,
                zodSchema: data.schema,
                results: data.results,
              }
            : msg
        )
      );
    } catch (err) {
      const rawError = err instanceof Error ? err.message : "Unknown error";
      const friendlyContent = rawError.includes("fetch")
        ? "Could not reach the server. Please check your connection and try again."
        : rawError.includes("timeout") || rawError.includes("Timeout")
          ? "The scraping request timed out. The target site may be slow or blocking requests."
          : "Something went wrong while scraping. Please try again or rephrase your request.";

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantId
            ? {
                ...msg,
                content: friendlyContent,
                status: "error" as const,
                error: rawError,
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-[var(--background)]">
      <ChatSidebar onNewChat={handleNewChat} />

      <div className="flex flex-1 flex-col">
        {messages.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center p-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 mb-6 shadow-lg shadow-violet-500/20">
              <MessageSquare className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-2">
              Start scraping
            </h2>
            <p className="text-[var(--muted-foreground)] text-center max-w-md mb-10">
              Describe what you want to scrape in plain English. I&apos;ll generate
              a Playwright script, execute it, and return structured data.
            </p>
            <div className="grid gap-3 sm:grid-cols-2 max-w-xl w-full">
              {([
                { icon: ShoppingCart, text: "Scrape product names and prices from an Amazon search page" },
                { icon: Utensils, text: "Get all restaurant names and ratings from Yelp" },
                { icon: Briefcase, text: "Extract job titles and companies from LinkedIn search" },
                { icon: Newspaper, text: "Collect article headlines from Hacker News front page" },
              ] as const).map(({ icon: Icon, text }) => (
                <button
                  key={text}
                  onClick={() => handleSend(text)}
                  className="group flex items-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-4 text-left text-sm text-[var(--muted-foreground)] transition-all hover:border-violet-500/40 hover:text-[var(--foreground)] hover:shadow-md hover:shadow-violet-500/5"
                >
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-violet-500 opacity-60 group-hover:opacity-100 transition-opacity" />
                  <span>{text}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-auto px-6">
            <div className="mx-auto max-w-3xl">
              {messages.map((msg) => (
                <ChatMessage
                  key={msg.id}
                  message={msg}
                  onSaveRecipe={
                    msg.role === "assistant" && msg.generatedScript
                      ? () => handleSaveRecipe(msg)
                      : undefined
                  }
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}

        <ChatInput onSend={handleSend} disabled={isLoading} />
      </div>
    </div>
  );
}
