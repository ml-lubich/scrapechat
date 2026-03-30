"use client";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  MessageSquare,
  Plus,
  LogOut,
  BookOpen,
  Settings,
  Menu,
  X,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ScrapeJob } from "@/types/database";

const SIDEBAR_LABEL_MAX_LENGTH = 40;

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

interface ChatSidebarProps {
  onNewChat?: () => void;
  recentJobs?: ScrapeJob[];
  onSelectJob?: (jobId: string) => void;
  onDeleteJob?: (jobId: string) => void;
  onClearHistory?: () => void;
}

export function ChatSidebar({ onNewChat, recentJobs = [], onSelectJob, onDeleteJob, onClearHistory }: ChatSidebarProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <>
      {/* Mobile toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-3 left-3 z-50 md:hidden"
        onClick={() => setOpen(!open)}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex h-full w-64 flex-col border-r border-[var(--border)] bg-[var(--card)] transition-transform md:static md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between border-b border-[var(--border)] p-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600">
              <MessageSquare className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold">ScrapeChatAI</span>
          </Link>
          <ThemeToggle />
        </div>

        <div className="p-3">
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={() => {
              onNewChat?.();
              setOpen(false);
            }}
          >
            <Plus className="h-4 w-4" />
            New Chat
          </Button>
        </div>

        <div className="flex-1 overflow-auto px-3 py-2">
          <div className="flex items-center justify-between px-2 mb-2">
            <p className="text-xs font-medium text-[var(--muted-foreground)]">
              Recent
            </p>
            {recentJobs.length > 0 && (
              <button
                onClick={() => {
                  if (window.confirm("Clear all chat history? This cannot be undone.")) {
                    onClearHistory?.();
                  }
                }}
                className="text-[10px] text-[var(--muted-foreground)] hover:text-red-500 transition-colors"
                data-testid="clear-all-button"
              >
                Clear All
              </button>
            )}
          </div>
          {recentJobs.length === 0 ? (
            <p className="px-2 text-xs text-[var(--muted-foreground)]">
              No conversations yet
            </p>
          ) : (
            <div className="space-y-0.5">
              {recentJobs.map((job) => {
                const label = job.message.length > SIDEBAR_LABEL_MAX_LENGTH
                  ? job.message.slice(0, SIDEBAR_LABEL_MAX_LENGTH) + "…"
                  : job.message;
                return (
                  <div
                    key={job.id}
                    className="group relative flex items-center rounded-lg transition-colors hover:bg-[var(--secondary)]"
                  >
                    <button
                      onClick={() => {
                        onSelectJob?.(job.id);
                        setOpen(false);
                      }}
                      className="flex w-full flex-col gap-0.5 px-2 py-2 text-left"
                    >
                      <span className="text-sm truncate text-[var(--foreground)] pr-6">
                        {label}
                      </span>
                      <span className="text-[10px] text-[var(--muted-foreground)]">
                        {formatRelativeTime(job.created_at)}
                      </span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteJob?.(job.id);
                      }}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-[var(--muted-foreground)] opacity-0 transition-opacity hover:text-red-500 group-hover:opacity-100"
                      aria-label={`Delete job: ${label}`}
                      data-testid={`delete-job-${job.id}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="border-t border-[var(--border)] p-3 space-y-1">
          <Link href="/recipes">
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-sm"
            >
              <BookOpen className="h-4 w-4" />
              Recipes
            </Button>
          </Link>
          <Link href="/settings">
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-sm"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Button>
          </Link>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-sm text-red-500 hover:text-red-600 hover:bg-red-500/10"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Log Out
          </Button>
        </div>
      </div>
    </>
  );
}
