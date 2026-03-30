"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Play, Trash2, Pencil, Check, X, Loader2, Globe } from "lucide-react";
import type { Recipe } from "@/types/database";

interface RecipeCardProps {
  recipe: Recipe;
  onRun: (recipe: Recipe) => void;
  onDelete: (id: string) => void;
  onSave: (id: string, updates: RecipeUpdateFields) => Promise<boolean>;
}

export interface RecipeUpdateFields {
  name: string;
  description: string | null;
  url_pattern: string | null;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function RecipeCard({ recipe, onRun, onDelete, onSave }: RecipeCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editName, setEditName] = useState(recipe.name);
  const [editDescription, setEditDescription] = useState(recipe.description || "");
  const [editUrlPattern, setEditUrlPattern] = useState(recipe.url_pattern || "");
  const [nameError, setNameError] = useState<string | null>(null);

  const startEditing = () => {
    setEditName(recipe.name);
    setEditDescription(recipe.description || "");
    setEditUrlPattern(recipe.url_pattern || "");
    setNameError(null);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setNameError(null);
  };

  const handleSave = async () => {
    const trimmedName = editName.trim();
    if (!trimmedName) {
      setNameError("Recipe name is required");
      return;
    }

    setNameError(null);
    setIsSaving(true);

    const success = await onSave(recipe.id, {
      name: trimmedName,
      description: editDescription.trim() || null,
      url_pattern: editUrlPattern.trim() || null,
    });

    setIsSaving(false);

    if (success) {
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      cancelEditing();
    } else if (e.key === "Enter" && e.metaKey) {
      handleSave();
    }
  };

  if (isEditing) {
    return (
      <Card data-testid={`recipe-card-${recipe.id}`}>
        <CardHeader>
          <div className="space-y-3" onKeyDown={handleKeyDown}>
            <div>
              <label htmlFor={`edit-name-${recipe.id}`} className="mb-1 block text-xs font-medium text-[var(--muted-foreground)]">
                Name
              </label>
              <Input
                id={`edit-name-${recipe.id}`}
                value={editName}
                onChange={(e) => {
                  setEditName(e.target.value);
                  if (nameError) setNameError(null);
                }}
                placeholder="Recipe name"
                aria-invalid={!!nameError}
                autoFocus
              />
              {nameError && (
                <p className="mt-1 text-xs text-red-500" role="alert">{nameError}</p>
              )}
            </div>
            <div>
              <label htmlFor={`edit-desc-${recipe.id}`} className="mb-1 block text-xs font-medium text-[var(--muted-foreground)]">
                Description
              </label>
              <Input
                id={`edit-desc-${recipe.id}`}
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="What does this recipe scrape?"
              />
            </div>
            <div>
              <label htmlFor={`edit-url-${recipe.id}`} className="mb-1 block text-xs font-medium text-[var(--muted-foreground)]">
                URL Pattern
              </label>
              <Input
                id={`edit-url-${recipe.id}`}
                value={editUrlPattern}
                onChange={(e) => setEditUrlPattern(e.target.value)}
                placeholder="https://example.com/..."
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--muted-foreground)]">
              Press ⌘Enter to save, Esc to cancel
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Check className="h-3.5 w-3.5" />
                )}
                Save
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5"
                onClick={cancelEditing}
                disabled={isSaving}
              >
                <X className="h-3.5 w-3.5" />
                Cancel
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid={`recipe-card-${recipe.id}`}>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-lg">{recipe.name}</CardTitle>
          <Badge variant="secondary" className="shrink-0 text-xs">
            {recipe.times_used} run{recipe.times_used !== 1 ? "s" : ""}
          </Badge>
        </div>
        <CardDescription>{recipe.description}</CardDescription>
        {recipe.url_pattern && (
          <div className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
            <Globe className="h-3 w-3" />
            <span className="truncate">{recipe.url_pattern}</span>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <span className="text-xs text-[var(--muted-foreground)]">
            Created {formatDate(recipe.created_at)}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => onRun(recipe)}
            >
              <Play className="h-3.5 w-3.5" />
              Run
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={startEditing}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-500 hover:text-red-600"
              onClick={() => onDelete(recipe.id)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
