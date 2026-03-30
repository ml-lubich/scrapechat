import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChatMessage } from "./chat-message";
import { ChatMessage as ChatMessageType } from "@/types/chat";

function makeMessage(overrides: Partial<ChatMessageType> = {}): ChatMessageType {
  return {
    id: "msg-1",
    role: "assistant",
    content: "Something went wrong.",
    timestamp: new Date("2026-01-15T10:00:00Z"),
    status: "complete",
    ...overrides,
  };
}

describe("ChatMessage", () => {
  it("renders message content", () => {
    render(<ChatMessage message={makeMessage({ content: "Hello world" })} />);

    expect(screen.getByText("Hello world")).toBeInTheDocument();
  });

  it("renders retry button on error messages with onRetry", () => {
    const onRetry = vi.fn();
    render(
      <ChatMessage
        message={makeMessage({ status: "error", error: "Network failure" })}
        onRetry={onRetry}
      />
    );

    expect(screen.getByRole("button", { name: /retry/i })).toBeInTheDocument();
  });

  it("calls onRetry when retry button is clicked", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(
      <ChatMessage
        message={makeMessage({ status: "error", error: "Timeout" })}
        onRetry={onRetry}
      />
    );

    await user.click(screen.getByRole("button", { name: /retry/i }));

    expect(onRetry).toHaveBeenCalledOnce();
  });

  it("does not render retry button on successful messages", () => {
    render(
      <ChatMessage
        message={makeMessage({ status: "complete" })}
        onRetry={vi.fn()}
      />
    );

    expect(screen.queryByRole("button", { name: /retry/i })).not.toBeInTheDocument();
  });

  it("does not render retry button when onRetry is not provided", () => {
    render(
      <ChatMessage
        message={makeMessage({ status: "error", error: "Failed" })}
      />
    );

    expect(screen.queryByRole("button", { name: /retry/i })).not.toBeInTheDocument();
  });

  it("does not render retry button on user messages", () => {
    render(
      <ChatMessage
        message={makeMessage({ role: "user", status: "error" })}
        onRetry={vi.fn()}
      />
    );

    expect(screen.queryByRole("button", { name: /retry/i })).not.toBeInTheDocument();
  });
});
