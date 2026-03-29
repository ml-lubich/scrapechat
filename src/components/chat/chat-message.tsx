"use client";

import { ChatMessage as ChatMessageType } from "@/types/chat";
import { cn } from "@/lib/utils";
import { Bot, User, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ResultsTable } from "@/components/chat/results-table";
import { useState } from "react";

interface ChatMessageProps {
  message: ChatMessageType;
  onSaveRecipe?: () => void;
}

export function ChatMessage({ message, onSaveRecipe }: ChatMessageProps) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);

  const copyScript = () => {
    if (message.generatedScript) {
      navigator.clipboard.writeText(message.generatedScript);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      className={cn("flex gap-3 py-4", isUser ? "justify-end" : "justify-start")}
    >
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600">
          <Bot className="h-4 w-4 text-white" />
        </div>
      )}

      <div
        className={cn(
          "max-w-[80%] space-y-3",
          isUser ? "items-end" : "items-start"
        )}
      >
        <div
          className={cn(
            "rounded-2xl px-4 py-3 text-sm",
            isUser
              ? "rounded-br-md bg-violet-600 text-white"
              : "rounded-bl-md bg-[var(--secondary)] text-[var(--foreground)]"
          )}
        >
          {message.content}
        </div>

        {message.status && message.status !== "complete" && (
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 animate-pulse rounded-full bg-violet-500" />
            <span className="text-xs text-[var(--muted-foreground)] capitalize">
              {message.status === "generating"
                ? "Generating script..."
                : message.status === "executing"
                  ? "Running scraper..."
                  : message.status === "sending"
                    ? "Sending..."
                    : message.status}
            </span>
          </div>
        )}

        {message.generatedScript && (
          <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] overflow-hidden">
            <div className="flex items-center justify-between border-b border-[var(--border)] px-3 py-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  Playwright
                </Badge>
                <span className="text-xs text-[var(--muted-foreground)]">
                  Generated Script
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={copyScript}
              >
                {copied ? (
                  <Check className="h-3 w-3 text-green-500" />
                ) : (
                  <Copy className="h-3 w-3" />
                )}
              </Button>
            </div>
            <pre className="max-h-64 overflow-auto p-3 text-xs">
              <code>{message.generatedScript}</code>
            </pre>
          </div>
        )}

        {message.zodSchema && (
          <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] overflow-hidden">
            <div className="flex items-center gap-2 border-b border-[var(--border)] px-3 py-2">
              <Badge variant="secondary" className="text-xs">
                Zod
              </Badge>
              <span className="text-xs text-[var(--muted-foreground)]">
                Validation Schema
              </span>
            </div>
            <pre className="max-h-40 overflow-auto p-3 text-xs">
              <code>{message.zodSchema}</code>
            </pre>
          </div>
        )}

        {message.results && message.results.data.length > 0 && (
          <ResultsTable results={message.results} onSaveRecipe={onSaveRecipe} />
        )}

        {message.error && (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-600 dark:text-red-400">
            {message.error}
          </div>
        )}
      </div>

      {isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--secondary)]">
          <User className="h-4 w-4" />
        </div>
      )}
    </div>
  );
}
