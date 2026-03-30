"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { History, Loader2, ExternalLink } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { ScrapeJob } from "@/types/database";

const RECENT_ACTIVITY_LIMIT = 10;

function truncateMessage(message: string, maxLength = 50): string {
  if (message.length <= maxLength) return message;
  return message.slice(0, maxLength).trimEnd() + "…";
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function statusVariant(status: ScrapeJob["status"]): "default" | "secondary" | "destructive" {
  if (status === "complete") return "default";
  if (status === "error") return "destructive";
  return "secondary";
}

function statusLabel(status: ScrapeJob["status"]): string {
  if (status === "complete") return "Complete";
  if (status === "error") return "Error";
  if (status === "generating") return "Generating";
  return "Pending";
}

interface RecentActivityListProps {
  jobs: ScrapeJob[];
}

export function RecentActivityList({ jobs }: RecentActivityListProps) {
  if (jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-[var(--border)] py-10">
        <History className="mb-3 h-8 w-8 text-[var(--muted-foreground)]" />
        <p className="text-sm font-medium text-[var(--muted-foreground)]">No activity yet</p>
        <p className="mt-1 text-xs text-[var(--muted-foreground)]">
          Your scraping jobs will appear here once you start scraping.
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-[var(--border)]">
      {jobs.map((job) => (
        <Link
          key={job.id}
          href={`/chat?job=${job.id}`}
          className="group flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0 transition-colors hover:bg-[var(--accent)] -mx-6 px-6"
        >
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium group-hover:text-violet-600">
              {truncateMessage(job.message)}
            </p>
            <p className="mt-0.5 text-xs text-[var(--muted-foreground)]">
              {formatDate(job.created_at)}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {job.items_count > 0 && (
              <span className="text-xs text-[var(--muted-foreground)]">
                {job.items_count} item{job.items_count !== 1 ? "s" : ""}
              </span>
            )}
            <Badge variant={statusVariant(job.status)} className="text-xs">
              {statusLabel(job.status)}
            </Badge>
            <ExternalLink className="h-3.5 w-3.5 text-[var(--muted-foreground)] opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
        </Link>
      ))}
    </div>
  );
}

export function RecentActivity() {
  const [jobs, setJobs] = useState<ScrapeJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRecentJobs() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setError("Not authenticated");
        setLoading(false);
        return;
      }

      const { data, error: queryError } = await supabase
        .from("scrape_jobs")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(RECENT_ACTIVITY_LIMIT);

      if (queryError) {
        setError("Failed to load recent activity");
        setLoading(false);
        return;
      }

      setJobs(data ?? []);
      setLoading(false);
    }

    fetchRecentJobs();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="h-6 w-6 animate-spin text-[var(--muted-foreground)]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-[var(--border)] py-10">
        <p className="text-sm text-[var(--muted-foreground)]">{error}</p>
      </div>
    );
  }

  return <RecentActivityList jobs={jobs} />;
}
