"use client";

import { Button } from "@/components/ui/button";
import {
  MessageSquare,
  Plus,
  LogOut,
  BookOpen,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function ChatSidebar() {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <div className="flex h-full w-64 flex-col border-r border-[var(--border)] bg-[var(--card)]">
      <div className="flex items-center gap-2 border-b border-[var(--border)] p-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600">
          <MessageSquare className="h-4 w-4 text-white" />
        </div>
        <span className="font-bold">ScrapeChatAI</span>
      </div>

      <div className="p-3">
        <Button variant="outline" className="w-full justify-start gap-2">
          <Plus className="h-4 w-4" />
          New Chat
        </Button>
      </div>

      <div className="flex-1 overflow-auto px-3 py-2">
        <p className="px-2 text-xs font-medium text-[var(--muted-foreground)] mb-2">
          Recent
        </p>
        <p className="px-2 text-xs text-[var(--muted-foreground)]">
          No conversations yet
        </p>
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
  );
}
