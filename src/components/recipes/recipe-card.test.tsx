import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RecipeCard, RecipeUpdateFields } from "./recipe-card";
import type { Recipe } from "@/types/database";

function makeMockRecipe(overrides: Partial<Recipe> = {}): Recipe {
  return {
    id: "recipe-1",
    user_id: "user-1",
    name: "Product Prices",
    description: "Scrape product prices from example.com",
    url_pattern: "https://example.com/products",
    script_template: "const data = await page.evaluate(() => {});",
    schema_definition: null,
    times_used: 3,
    created_at: "2026-03-15T10:00:00Z",
    updated_at: "2026-03-15T10:00:00Z",
    ...overrides,
  };
}

describe("RecipeCard", () => {
  let mockOnRun: ReturnType<typeof vi.fn>;
  let mockOnDelete: ReturnType<typeof vi.fn>;
  let mockOnSave: ReturnType<typeof vi.fn<(id: string, updates: RecipeUpdateFields) => Promise<boolean>>>;

  beforeEach(() => {
    mockOnRun = vi.fn();
    mockOnDelete = vi.fn();
    mockOnSave = vi.fn().mockResolvedValue(true);
  });

  it("renders recipe name, description, and run count", () => {
    const recipe = makeMockRecipe();
    render(
      <RecipeCard recipe={recipe} onRun={mockOnRun} onDelete={mockOnDelete} onSave={mockOnSave} />
    );

    expect(screen.getByText("Product Prices")).toBeInTheDocument();
    expect(screen.getByText("Scrape product prices from example.com")).toBeInTheDocument();
    expect(screen.getByText("3 runs")).toBeInTheDocument();
  });

  it("shows singular 'run' for times_used === 1", () => {
    const recipe = makeMockRecipe({ times_used: 1 });
    render(
      <RecipeCard recipe={recipe} onRun={mockOnRun} onDelete={mockOnDelete} onSave={mockOnSave} />
    );

    expect(screen.getByText("1 run")).toBeInTheDocument();
  });

  it("displays URL pattern when present", () => {
    const recipe = makeMockRecipe({ url_pattern: "https://example.com/products" });
    render(
      <RecipeCard recipe={recipe} onRun={mockOnRun} onDelete={mockOnDelete} onSave={mockOnSave} />
    );

    expect(screen.getByText("https://example.com/products")).toBeInTheDocument();
  });

  it("hides URL pattern when null", () => {
    const recipe = makeMockRecipe({ url_pattern: null });
    render(
      <RecipeCard recipe={recipe} onRun={mockOnRun} onDelete={mockOnDelete} onSave={mockOnSave} />
    );

    expect(screen.queryByText("https://example.com/products")).not.toBeInTheDocument();
  });

  it("calls onRun when Run button is clicked", async () => {
    const user = userEvent.setup();
    const recipe = makeMockRecipe();
    render(
      <RecipeCard recipe={recipe} onRun={mockOnRun} onDelete={mockOnDelete} onSave={mockOnSave} />
    );

    await user.click(screen.getByText("Run"));
    expect(mockOnRun).toHaveBeenCalledWith(recipe);
  });

  it("calls onDelete when Delete button is clicked", async () => {
    const user = userEvent.setup();
    const recipe = makeMockRecipe();
    render(
      <RecipeCard recipe={recipe} onRun={mockOnRun} onDelete={mockOnDelete} onSave={mockOnSave} />
    );

    // The delete button has only the Trash2 icon, find by role
    const buttons = screen.getAllByRole("button");
    const deleteBtn = buttons.find((btn) => btn.classList.contains("text-red-500"));
    expect(deleteBtn).toBeTruthy();
    await user.click(deleteBtn!);
    expect(mockOnDelete).toHaveBeenCalledWith("recipe-1");
  });

  it("enters edit mode when Edit button is clicked", async () => {
    const user = userEvent.setup();
    const recipe = makeMockRecipe();
    render(
      <RecipeCard recipe={recipe} onRun={mockOnRun} onDelete={mockOnDelete} onSave={mockOnSave} />
    );

    // Find and click the edit button (Pencil icon button)
    const buttons = screen.getAllByRole("button");
    // Edit is the button between Run and Delete (3rd button, index 1)
    const editBtn = buttons[1]; // Run=0, Edit=1, Delete=2
    await user.click(editBtn);

    // Should now show edit form with input fields
    expect(screen.getByLabelText("Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Description")).toBeInTheDocument();
    expect(screen.getByLabelText("URL Pattern")).toBeInTheDocument();
  });

  it("pre-fills edit form with current recipe values", async () => {
    const user = userEvent.setup();
    const recipe = makeMockRecipe({
      name: "My Recipe",
      description: "Some description",
      url_pattern: "https://test.com",
    });
    render(
      <RecipeCard recipe={recipe} onRun={mockOnRun} onDelete={mockOnDelete} onSave={mockOnSave} />
    );

    const buttons = screen.getAllByRole("button");
    await user.click(buttons[1]); // Edit button

    expect(screen.getByLabelText("Name")).toHaveValue("My Recipe");
    expect(screen.getByLabelText("Description")).toHaveValue("Some description");
    expect(screen.getByLabelText("URL Pattern")).toHaveValue("https://test.com");
  });

  it("validates that name is required", async () => {
    const user = userEvent.setup();
    const recipe = makeMockRecipe();
    render(
      <RecipeCard recipe={recipe} onRun={mockOnRun} onDelete={mockOnDelete} onSave={mockOnSave} />
    );

    // Enter edit mode
    const buttons = screen.getAllByRole("button");
    await user.click(buttons[1]);

    // Clear the name field
    const nameInput = screen.getByLabelText("Name");
    await user.clear(nameInput);

    // Click Save
    await user.click(screen.getByText("Save"));

    // Should show error
    expect(screen.getByRole("alert")).toHaveTextContent("Recipe name is required");
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it("saves updated recipe and exits edit mode", async () => {
    const user = userEvent.setup();
    const recipe = makeMockRecipe();
    render(
      <RecipeCard recipe={recipe} onRun={mockOnRun} onDelete={mockOnDelete} onSave={mockOnSave} />
    );

    // Enter edit mode
    const buttons = screen.getAllByRole("button");
    await user.click(buttons[1]);

    // Update name
    const nameInput = screen.getByLabelText("Name");
    await user.clear(nameInput);
    await user.type(nameInput, "Updated Recipe Name");

    // Update description
    const descInput = screen.getByLabelText("Description");
    await user.clear(descInput);
    await user.type(descInput, "Updated description");

    // Click Save
    await user.click(screen.getByText("Save"));

    await waitFor(() => {
      expect(mockOnSave).toHaveBeenCalledWith("recipe-1", {
        name: "Updated Recipe Name",
        description: "Updated description",
        url_pattern: "https://example.com/products",
      });
    });

    // Should exit edit mode (no more Name label)
    await waitFor(() => {
      expect(screen.queryByLabelText("Name")).not.toBeInTheDocument();
    });
  });

  it("cancels editing and reverts to display mode", async () => {
    const user = userEvent.setup();
    const recipe = makeMockRecipe();
    render(
      <RecipeCard recipe={recipe} onRun={mockOnRun} onDelete={mockOnDelete} onSave={mockOnSave} />
    );

    // Enter edit mode
    const buttons = screen.getAllByRole("button");
    await user.click(buttons[1]);

    // Modify the name
    const nameInput = screen.getByLabelText("Name");
    await user.clear(nameInput);
    await user.type(nameInput, "Changed Name");

    // Click Cancel
    await user.click(screen.getByText("Cancel"));

    // Should be back in display mode with original name
    expect(screen.getByText("Product Prices")).toBeInTheDocument();
    expect(screen.queryByLabelText("Name")).not.toBeInTheDocument();
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it("stays in edit mode when save fails", async () => {
    mockOnSave.mockResolvedValue(false);
    const user = userEvent.setup();
    const recipe = makeMockRecipe();
    render(
      <RecipeCard recipe={recipe} onRun={mockOnRun} onDelete={mockOnDelete} onSave={mockOnSave} />
    );

    // Enter edit mode
    const buttons = screen.getAllByRole("button");
    await user.click(buttons[1]);

    // Click Save
    await user.click(screen.getByText("Save"));

    // Should still be in edit mode
    await waitFor(() => {
      expect(screen.getByLabelText("Name")).toBeInTheDocument();
    });
  });

  it("clears name error when user types", async () => {
    const user = userEvent.setup();
    const recipe = makeMockRecipe();
    render(
      <RecipeCard recipe={recipe} onRun={mockOnRun} onDelete={mockOnDelete} onSave={mockOnSave} />
    );

    // Enter edit mode
    const buttons = screen.getAllByRole("button");
    await user.click(buttons[1]);

    // Clear name and try to save to trigger error
    const nameInput = screen.getByLabelText("Name");
    await user.clear(nameInput);
    await user.click(screen.getByText("Save"));
    expect(screen.getByRole("alert")).toBeInTheDocument();

    // Type something — error should clear
    await user.type(nameInput, "a");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("formats date correctly", () => {
    const recipe = makeMockRecipe({ created_at: "2026-01-15T10:00:00Z" });
    render(
      <RecipeCard recipe={recipe} onRun={mockOnRun} onDelete={mockOnDelete} onSave={mockOnSave} />
    );

    expect(screen.getByText(/Created Jan 15, 2026/)).toBeInTheDocument();
  });
});
