"use client";

import { ChatSidebar } from "@/components/chat/chat-sidebar";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
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
                    Free
                  </Badge>
                  <span className="text-sm text-[var(--muted-foreground)]">
                    50 scrapes/month
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Usage this month</span>
                    <span>0 / 50 scrapes</span>
                  </div>
                  <div className="h-2 rounded-full bg-[var(--secondary)]">
                    <div className="h-2 rounded-full bg-violet-600" style={{ width: "0%" }} />
                  </div>
                </div>
                <Button className="w-full">Upgrade to Pro — $29/mo</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Account</CardTitle>
                <CardDescription>Your profile information</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-[var(--muted-foreground)]">
                  Signed in via Google OAuth. Account management is handled through your Google account.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
