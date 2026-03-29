"use client";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ChatSidebar } from "@/components/chat/chat-sidebar";
import { BookOpen, Play, Trash2, Loader2 } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Recipe } from "@/types/database";

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRecipes = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("recipes")
      .select("*")
      .order("created_at", { ascending: false });

    setRecipes(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadRecipes();
  }, [loadRecipes]);

  const handleDelete = async (id: string) => {
    const supabase = createClient();
    await supabase.from("recipes").delete().eq("id", id);
    setRecipes((prev) => prev.filter((r) => r.id !== id));
  };

  const handleRun = async (recipe: Recipe) => {
    const supabase = createClient();
    // Increment times_used
    await supabase
      .from("recipes")
      .update({ times_used: recipe.times_used + 1 })
      .eq("id", recipe.id);

    // Navigate to chat with the recipe description pre-filled
    window.location.href = `/chat?message=${encodeURIComponent(recipe.description || recipe.name)}`;
  };

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

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-[var(--muted-foreground)]" />
            </div>
          ) : recipes.length === 0 ? (
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
                        Used {recipe.times_used} time{recipe.times_used !== 1 ? "s" : ""}
                      </span>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1.5"
                          onClick={() => handleRun(recipe)}
                        >
                          <Play className="h-3.5 w-3.5" />
                          Run
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-600"
                          onClick={() => handleDelete(recipe.id)}
                        >
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
