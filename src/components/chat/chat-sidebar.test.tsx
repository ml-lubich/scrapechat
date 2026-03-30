import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChatSidebar } from "./chat-sidebar";
import { ScrapeJob } from "@/types/database";

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

// Mock supabase client
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: { signOut: vi.fn() },
  }),
}));

// Mock ThemeToggle to avoid localStorage issues
vi.mock("@/components/theme-toggle", () => ({
  ThemeToggle: () => <div data-testid="theme-toggle" />,
}));

function makeMockJob(overrides: Partial<ScrapeJob> = {}): ScrapeJob {
  return {
    id: "job-1",
    user_id: "user-1",
    message: "Scrape product prices from example.com",
    url: "https://example.com",
    status: "complete",
    ai_response: "Here are the results",
    generated_script: "script",
    zod_schema: null,
    results: null,
    items_count: 0,
    error: null,
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

describe("ChatSidebar", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders 'No conversations yet' when there are no jobs", () => {
    render(<ChatSidebar recentJobs={[]} />);
    expect(screen.getByText("No conversations yet")).toBeInTheDocument();
  });

  it("does not show Clear All button when there are no jobs", () => {
    render(<ChatSidebar recentJobs={[]} />);
    expect(screen.queryByTestId("clear-all-button")).not.toBeInTheDocument();
  });

  it("shows Clear All button when there are jobs", () => {
    render(<ChatSidebar recentJobs={[makeMockJob()]} />);
    expect(screen.getByTestId("clear-all-button")).toBeInTheDocument();
  });

  it("shows delete button on hover for each job", () => {
    const job = makeMockJob();
    render(<ChatSidebar recentJobs={[job]} />);
    // The delete button exists in the DOM (hidden via opacity)
    expect(screen.getByTestId(`delete-job-${job.id}`)).toBeInTheDocument();
  });

  it("calls onDeleteJob when trash icon is clicked", async () => {
    const user = userEvent.setup();
    const onDeleteJob = vi.fn();
    const job = makeMockJob({ id: "job-42" });

    render(<ChatSidebar recentJobs={[job]} onDeleteJob={onDeleteJob} />);

    await user.click(screen.getByTestId("delete-job-job-42"));
    expect(onDeleteJob).toHaveBeenCalledWith("job-42");
  });

  it("does not call onSelectJob when trash icon is clicked", async () => {
    const user = userEvent.setup();
    const onSelectJob = vi.fn();
    const onDeleteJob = vi.fn();
    const job = makeMockJob({ id: "job-42" });

    render(
      <ChatSidebar
        recentJobs={[job]}
        onSelectJob={onSelectJob}
        onDeleteJob={onDeleteJob}
      />
    );

    await user.click(screen.getByTestId("delete-job-job-42"));
    expect(onDeleteJob).toHaveBeenCalledWith("job-42");
    expect(onSelectJob).not.toHaveBeenCalled();
  });

  it("calls onClearHistory when Clear All is confirmed", async () => {
    const user = userEvent.setup();
    const onClearHistory = vi.fn();
    window.confirm = vi.fn(() => true);

    render(
      <ChatSidebar recentJobs={[makeMockJob()]} onClearHistory={onClearHistory} />
    );

    await user.click(screen.getByTestId("clear-all-button"));
    expect(window.confirm).toHaveBeenCalled();
    expect(onClearHistory).toHaveBeenCalledOnce();
  });

  it("does not call onClearHistory when Clear All is cancelled", async () => {
    const user = userEvent.setup();
    const onClearHistory = vi.fn();
    window.confirm = vi.fn(() => false);

    render(
      <ChatSidebar recentJobs={[makeMockJob()]} onClearHistory={onClearHistory} />
    );

    await user.click(screen.getByTestId("clear-all-button"));
    expect(window.confirm).toHaveBeenCalled();
    expect(onClearHistory).not.toHaveBeenCalled();
  });

  it("renders multiple jobs in the sidebar", () => {
    const jobs = [
      makeMockJob({ id: "job-1", message: "First job" }),
      makeMockJob({ id: "job-2", message: "Second job" }),
      makeMockJob({ id: "job-3", message: "Third job" }),
    ];

    render(<ChatSidebar recentJobs={jobs} />);

    expect(screen.getByText("First job")).toBeInTheDocument();
    expect(screen.getByText("Second job")).toBeInTheDocument();
    expect(screen.getByText("Third job")).toBeInTheDocument();
    expect(screen.getByTestId("delete-job-job-1")).toBeInTheDocument();
    expect(screen.getByTestId("delete-job-job-2")).toBeInTheDocument();
    expect(screen.getByTestId("delete-job-job-3")).toBeInTheDocument();
  });

  it("truncates long job messages in the sidebar", () => {
    const longMessage = "A".repeat(50);
    const job = makeMockJob({ message: longMessage });

    render(<ChatSidebar recentJobs={[job]} />);

    expect(screen.getByText("A".repeat(40) + "…")).toBeInTheDocument();
  });
});
