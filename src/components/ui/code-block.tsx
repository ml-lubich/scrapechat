"use client";

import { useState, useEffect, useCallback } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  code: string;
  language: "typescript" | "javascript";
  label: string;
  description?: string;
  maxHeight?: string;
}

function useHighlightedHtml(code: string, language: string) {
  const [html, setHtml] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function highlight() {
      const { codeToHtml } = await import("shiki/bundle/web");
      const result = await codeToHtml(code, {
        lang: language,
        themes: { light: "github-light", dark: "github-dark" },
        defaultColor: false,
      });
      if (!cancelled) setHtml(result);
    }

    highlight();
    return () => { cancelled = true; };
  }, [code, language]);

  return html;
}

export function CodeBlock({
  code,
  language,
  label,
  description,
  maxHeight = "max-h-64",
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const html = useHighlightedHtml(code, language);

  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] overflow-hidden">
      <div className="flex items-center justify-between border-b border-[var(--border)] px-3 py-2">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {label}
          </Badge>
          {description && (
            <span className="text-xs text-[var(--muted-foreground)]">
              {description}
            </span>
          )}
        </div>
        <Button variant="ghost" size="icon-xs" onClick={copyToClipboard}>
          {copied ? (
            <Check className="h-3 w-3 text-green-500" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
        </Button>
      </div>
      {html ? (
        <div
          className={cn(
            "overflow-auto p-3 text-xs [&_pre]:!bg-transparent [&_code]:!bg-transparent [&_.shiki]:!bg-transparent",
            maxHeight
          )}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <pre className={cn("overflow-auto p-3 text-xs", maxHeight)}>
          <code>{code}</code>
        </pre>
      )}
    </div>
  );
}
