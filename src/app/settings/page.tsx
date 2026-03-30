"use client";

import { ChatSidebar } from "@/components/chat/chat-sidebar";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, History, Key } from "lucide-react";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types/database";
import { FREE_TIER_LIMIT } from "@/lib/constants";
import { RecentActivity } from "@/components/settings/recent-activity";

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Settings — ScrapeChatAI";
  }, []);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        setEmail(user.email || null);
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        setProfile(data);
      }
      setLoading(false);
    }
    load();
  }, []);

  const isPro = profile?.subscription_tier === "pro";
  const scrapeLimit = isPro ? "Unlimited" : `${FREE_TIER_LIMIT}`;
  const scrapeCount = profile?.scrape_count_this_month ?? 0;
  const usagePercent = isPro ? 0 : Math.min(100, (scrapeCount / FREE_TIER_LIMIT) * 100);

  const handleUpgrade = () => {
    // Will be connected to Stripe in iteration 6
    window.location.href = "/api/stripe/checkout";
  };

  const handleManageBilling = () => {
    window.location.href = "/api/stripe/portal";
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-[var(--background)]">
        <ChatSidebar />
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[var(--muted-foreground)]" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[var(--background)]">
      <ChatSidebar />

      <div className="flex-1 overflow-auto p-8">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="mt-2 text-[var(--muted-foreground)]">
              Manage your account and billing.
            </p>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Current Plan</CardTitle>
                <CardDescription>Your subscription and usage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="text-sm px-3 py-1">
                    {isPro ? "Pro" : "Free"}
                  </Badge>
                  <span className="text-sm text-[var(--muted-foreground)]">
                    {isPro ? "Unlimited scrapes" : `${FREE_TIER_LIMIT} scrapes/month`}
                  </span>
                </div>
                {!isPro && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Usage this month</span>
                      <span>{scrapeCount} / {scrapeLimit} scrapes</span>
                    </div>
                    <div className="h-2 rounded-full bg-[var(--secondary)]">
                      <div
                        className="h-2 rounded-full bg-violet-600 transition-all"
                        style={{ width: `${usagePercent}%` }}
                      />
                    </div>
                  </div>
                )}
                {isPro ? (
                  <Button variant="outline" className="w-full" onClick={handleManageBilling}>
                    Manage Billing
                  </Button>
                ) : (
                  <Button className="w-full" onClick={handleUpgrade}>
                    Upgrade to Pro — $29/mo
                  </Button>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Account</CardTitle>
                <CardDescription>Your profile information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {email && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--muted-foreground)]">Email</span>
                    <span className="text-sm">{email}</span>
                  </div>
                )}
                {profile?.full_name && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[var(--muted-foreground)]">Name</span>
                    <span className="text-sm">{profile.full_name}</span>
                  </div>
                )}
                <p className="text-xs text-[var(--muted-foreground)] pt-2">
                  Signed in via Google OAuth. Account management is handled through your Google account.
                </p>
              </CardContent>
            </Card>

            <div className="border-t border-[var(--border)]" />

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <History className="h-5 w-5 text-[var(--muted-foreground)]" />
                  <div>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Your scraping history and usage</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <RecentActivity />
              </CardContent>
            </Card>

            <div className="border-t border-[var(--border)]" />

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Key className="h-5 w-5 text-[var(--muted-foreground)]" />
                  <div>
                    <CardTitle>API Access</CardTitle>
                    <CardDescription>Manage API keys for programmatic access</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-[var(--border)] py-10">
                  <Key className="mb-3 h-8 w-8 text-[var(--muted-foreground)]" />
                  <p className="text-sm font-medium text-[var(--muted-foreground)]">Coming soon</p>
                  <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                    Generate API keys to integrate ScrapeChatAI into your workflows.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
