import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChatInput } from "./chat-input";

describe("ChatInput", () => {
  it("renders textarea and send button", () => {
    render(<ChatInput onSend={vi.fn()} />);

    expect(screen.getByRole("textbox")).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("shows placeholder text", () => {
    render(<ChatInput onSend={vi.fn()} />);

    expect(screen.getByPlaceholderText(/describe what you want to scrape/i)).toBeInTheDocument();
  });

  it("send button is disabled when input is empty", () => {
    render(<ChatInput onSend={vi.fn()} />);

    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("enables send button when text is entered", async () => {
    const user = userEvent.setup();
    render(<ChatInput onSend={vi.fn()} />);

    await user.type(screen.getByRole("textbox"), "scrape example.com");

    expect(screen.getByRole("button")).toBeEnabled();
  });

  it("calls onSend with trimmed message on button click", async () => {
    const onSend = vi.fn();
    const user = userEvent.setup();
    render(<ChatInput onSend={onSend} />);

    await user.type(screen.getByRole("textbox"), "  scrape example.com  ");
    await user.click(screen.getByRole("button"));

    expect(onSend).toHaveBeenCalledWith("scrape example.com");
  });

  it("clears input after sending", async () => {
    const user = userEvent.setup();
    render(<ChatInput onSend={vi.fn()} />);

    const textarea = screen.getByRole("textbox");
    await user.type(textarea, "scrape example.com");
    await user.click(screen.getByRole("button"));

    expect(textarea).toHaveValue("");
  });

  it("sends on Enter key press", async () => {
    const onSend = vi.fn();
    const user = userEvent.setup();
    render(<ChatInput onSend={onSend} />);

    await user.type(screen.getByRole("textbox"), "scrape example.com{Enter}");

    expect(onSend).toHaveBeenCalledWith("scrape example.com");
  });

  it("does not send on Shift+Enter (allows newlines)", async () => {
    const onSend = vi.fn();
    const user = userEvent.setup();
    render(<ChatInput onSend={onSend} />);

    await user.type(screen.getByRole("textbox"), "line one{Shift>}{Enter}{/Shift}line two");

    expect(onSend).not.toHaveBeenCalled();
  });

  it("disables textarea and button when disabled prop is true", () => {
    render(<ChatInput onSend={vi.fn()} disabled />);

    expect(screen.getByRole("textbox")).toBeDisabled();
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("does not send whitespace-only messages", async () => {
    const onSend = vi.fn();
    const user = userEvent.setup();
    render(<ChatInput onSend={onSend} />);

    await user.type(screen.getByRole("textbox"), "   {Enter}");

    expect(onSend).not.toHaveBeenCalled();
  });
});
