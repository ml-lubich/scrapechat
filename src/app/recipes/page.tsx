"use client";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ChatSidebar } from "@/components/chat/chat-sidebar";
import { BookOpen, Play, Trash2 } from "lucide-react";
import { useState } from "react";

interface Recipe {
  id: string;
  name: string;
  description: string;
  urlPattern: string;
  timesUsed: number;
  createdAt: Date;
}

export default function RecipesPage() {
  const [recipes] = useState<Recipe[]>([]);

  return (
    <div className="flex h-screen bg-[var(--background)]">
      <ChatSidebar />

      <div className="flex-1 overflow-auto p-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Saved Recipes</h1>
            <p className="mt-2 text-[var(--muted-foreground)]">
              Reusable scraping workflows you&apos;ve saved from previous chats.
            </p>
          </div>

          {recipes.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border)] py-20">
              <BookOpen className="mb-4 h-12 w-12 text-[var(--muted-foreground)]" />
              <h3 className="text-lg font-semibold">No recipes yet</h3>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                After scraping, click &quot;Save Recipe&quot; to save your workflow.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {recipes.map((recipe) => (
                <Card key={recipe.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">{recipe.name}</CardTitle>
                    <CardDescription>{recipe.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[var(--muted-foreground)]">
                        Used {recipe.timesUsed} time{recipe.timesUsed !== 1 ? "s" : ""}
                      </span>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="gap-1.5">
                          <Play className="h-3.5 w-3.5" />
                          Run
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600">
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
