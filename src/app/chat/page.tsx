"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ChatMessage } from "@/components/chat/chat-message";
import { ChatInput } from "@/components/chat/chat-input";
import { ChatSidebar } from "@/components/chat/chat-sidebar";
import { ChatMessage as ChatMessageType } from "@/types/chat";
import { ScrapeJob } from "@/types/database";
import { MessageSquare, ShoppingCart, Utensils, Briefcase, Newspaper } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { HISTORY_LIMIT, CONTEXT_MESSAGE_LIMIT } from "@/lib/constants";

function scrapeJobToMessages(job: ScrapeJob): ChatMessageType[] {
  const userMsg: ChatMessageType = {
    id: `${job.id}-user`,
    role: "user",
    content: job.message,
    timestamp: new Date(job.created_at),
    status: "complete",
  };

  const assistantMsg: ChatMessageType = {
    id: `${job.id}-assistant`,
    role: "assistant",
    content: job.ai_response || "",
    timestamp: new Date(job.created_at),
    status: job.status === "error" ? "error" : "complete",
    generatedScript: job.generated_script || undefined,
    zodSchema: job.zod_schema || undefined,
    results: job.results
      ? { data: job.results, itemsCount: job.items_count }
      : undefined,
    error: job.error || undefined,
  };

  return [userMsg, assistantMsg];
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [recentJobs, setRecentJobs] = useState<ScrapeJob[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.title = "Chat — ScrapeChatAI";
  }, []);

  // Load chat history from scrape_jobs on mount
  useEffect(() => {
    async function loadHistory() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: jobs } = await supabase
        .from("scrape_jobs")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(HISTORY_LIMIT);

      if (jobs && jobs.length > 0) {
        setRecentJobs(jobs);
        const chronological = [...jobs].reverse();
        const chatMessages = chronological.flatMap(scrapeJobToMessages);
        setMessages(chatMessages);
      }
      setHistoryLoaded(true);
    }

    loadHistory();
  }, []);

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

    const { error } = await supabase.from("recipes").insert({
      user_id: user.id,
      name,
      description: message.content,
      url_pattern: null,
      script_template: message.generatedScript,
      schema_definition: message.zodSchema || null,
    });

    if (error) {
      console.error("Failed to save recipe:", error);
      alert("Failed to save recipe. Please try again.");
    }
  }, []);

  const handleNewChat = useCallback(() => {
    setMessages([]);
  }, []);

  const handleSelectJob = useCallback((jobId: string) => {
    const el = document.getElementById(`${jobId}-user`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
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
      // Build conversation history for multi-turn context
      const recentMessages = messages
        .filter((m) => m.status === "complete")
        .slice(-CONTEXT_MESSAGE_LIMIT)
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content, history: recentMessages }),
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

      // Refresh sidebar with latest jobs
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: jobs } = await supabase
          .from("scrape_jobs")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(HISTORY_LIMIT);
        if (jobs) setRecentJobs(jobs);
      }
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
      <ChatSidebar
        onNewChat={handleNewChat}
        recentJobs={recentJobs}
        onSelectJob={handleSelectJob}
      />

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
