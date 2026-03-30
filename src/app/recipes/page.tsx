"use client";

import { Button } from "@/components/ui/button";
import { ChatSidebar } from "@/components/chat/chat-sidebar";
import { RecipeCard, RecipeUpdateFields } from "@/components/recipes/recipe-card";
import { BookOpen, Loader2, Search, MessageSquare } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Recipe } from "@/types/database";
import Link from "next/link";

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    document.title = "Recipes — ScrapeChatAI";
  }, []);

  const loadRecipes = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data } = await supabase
      .from("recipes")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    setRecipes(data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadRecipes();
  }, [loadRecipes]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this recipe? This action cannot be undone.")) {
      return;
    }
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("recipes")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Failed to delete recipe:", error);
      return;
    }
    setRecipes((prev) => prev.filter((r) => r.id !== id));
  };

  const handleRun = async (recipe: Recipe) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("recipes")
      .update({ times_used: recipe.times_used + 1 })
      .eq("id", recipe.id)
      .eq("user_id", user.id);

    window.location.href = `/chat?message=${encodeURIComponent(recipe.description || recipe.name)}`;
  };

  const handleSave = async (id: string, updates: RecipeUpdateFields): Promise<boolean> => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
      .from("recipes")
      .update(updates)
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Failed to update recipe:", error);
      return false;
    }

    setRecipes((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
    );
    return true;
  };

  const filteredRecipes = recipes.filter((recipe) =>
    recipe.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

          {!loading && recipes.length > 0 && (
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted-foreground)]" />
              <input
                type="text"
                placeholder="Search recipes by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] py-2 pl-10 pr-4 text-sm placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-violet-500/40"
              />
            </div>
          )}

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
              <Link href="/chat">
                <Button variant="outline" className="mt-4 gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Start Scraping
                </Button>
              </Link>
            </div>
          ) : filteredRecipes.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border)] py-20">
              <Search className="mb-4 h-12 w-12 text-[var(--muted-foreground)]" />
              <h3 className="text-lg font-semibold">No matching recipes</h3>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                Try a different search term.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredRecipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  onRun={handleRun}
                  onDelete={handleDelete}
                  onSave={handleSave}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
