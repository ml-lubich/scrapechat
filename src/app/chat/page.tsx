"use client";

import { useState, useRef, useEffect } from "react";
import { ChatMessage } from "@/components/chat/chat-message";
import { ChatInput } from "@/components/chat/chat-input";
import { ChatSidebar } from "@/components/chat/chat-sidebar";
import { ChatMessage as ChatMessageType } from "@/types/chat";
import { MessageSquare } from "lucide-react";

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
                status: "complete",
                generatedScript: data.script,
                zodSchema: data.schema,
                results: data.results,
              }
            : msg
        )
      );
    } catch (err) {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantId
            ? {
                ...msg,
                content: "Something went wrong. Please try again.",
                status: "error",
                error: err instanceof Error ? err.message : "Unknown error",
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
      <ChatSidebar />

      <div className="flex flex-1 flex-col">
        {messages.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center p-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 mb-6">
              <MessageSquare className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold mb-2">
              What do you want to scrape?
            </h2>
            <p className="text-[var(--muted-foreground)] text-center max-w-md mb-8">
              Describe the data you need and the website URL. I&apos;ll generate
              a Playwright script, run it, and return structured results.
            </p>
            <div className="grid gap-3 sm:grid-cols-2 max-w-lg w-full">
              {[
                "Scrape product names and prices from an Amazon search page",
                "Get all restaurant names and ratings from Yelp",
                "Extract job titles and companies from LinkedIn search",
                "Collect article headlines from Hacker News front page",
              ].map((example) => (
                <button
                  key={example}
                  onClick={() => handleSend(example)}
                  className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-left text-sm text-[var(--muted-foreground)] transition-colors hover:border-violet-500/40 hover:text-[var(--foreground)]"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-auto px-6">
            <div className="mx-auto max-w-3xl">
              {messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
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
