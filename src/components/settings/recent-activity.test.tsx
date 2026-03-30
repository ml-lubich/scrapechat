import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { RecentActivityList } from "./recent-activity";
import type { ScrapeJob } from "@/types/database";

function makeScrapeJob(overrides: Partial<ScrapeJob> = {}): ScrapeJob {
  return {
    id: "job-1",
    user_id: "user-1",
    message: "Scrape product prices from example.com",
    url: "https://example.com",
    status: "complete",
    ai_response: null,
    generated_script: null,
    zod_schema: null,
    results: null,
    items_count: 5,
    error: null,
    created_at: "2026-03-28T10:30:00Z",
    ...overrides,
  };
}

describe("RecentActivityList", () => {
  it("renders empty state when no jobs", () => {
    render(<RecentActivityList jobs={[]} />);

    expect(screen.getByText("No activity yet")).toBeInTheDocument();
    expect(screen.getByText(/your scraping jobs will appear here/i)).toBeInTheDocument();
  });

  it("renders job messages", () => {
    const jobs = [
      makeScrapeJob({ id: "1", message: "Scrape prices" }),
      makeScrapeJob({ id: "2", message: "Scrape reviews" }),
    ];

    render(<RecentActivityList jobs={jobs} />);

    expect(screen.getByText("Scrape prices")).toBeInTheDocument();
    expect(screen.getByText("Scrape reviews")).toBeInTheDocument();
  });

  it("truncates long messages", () => {
    const longMessage = "This is a very long message that should be truncated after fifty characters total";
    const jobs = [makeScrapeJob({ message: longMessage })];

    render(<RecentActivityList jobs={jobs} />);

    expect(screen.queryByText(longMessage)).not.toBeInTheDocument();
    expect(screen.getByText(/This is a very long message that should be truncat…/)).toBeInTheDocument();
  });

  it("shows status badge for complete jobs", () => {
    const jobs = [makeScrapeJob({ status: "complete" })];

    render(<RecentActivityList jobs={jobs} />);

    expect(screen.getByText("Complete")).toBeInTheDocument();
  });

  it("shows status badge for error jobs", () => {
    const jobs = [makeScrapeJob({ status: "error" })];

    render(<RecentActivityList jobs={jobs} />);

    expect(screen.getByText("Error")).toBeInTheDocument();
  });

  it("shows item count", () => {
    const jobs = [makeScrapeJob({ items_count: 12 })];

    render(<RecentActivityList jobs={jobs} />);

    expect(screen.getByText("12 items")).toBeInTheDocument();
  });

  it("shows singular item label for count of 1", () => {
    const jobs = [makeScrapeJob({ items_count: 1 })];

    render(<RecentActivityList jobs={jobs} />);

    expect(screen.getByText("1 item")).toBeInTheDocument();
  });

  it("hides item count when zero", () => {
    const jobs = [makeScrapeJob({ items_count: 0 })];

    render(<RecentActivityList jobs={jobs} />);

    expect(screen.queryByText(/item/)).not.toBeInTheDocument();
  });

  it("links rows to chat with job id", () => {
    const jobs = [makeScrapeJob({ id: "abc-123" })];

    render(<RecentActivityList jobs={jobs} />);

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/chat?job=abc-123");
  });

  it("formats dates", () => {
    const jobs = [makeScrapeJob({ created_at: "2026-03-28T10:30:00Z" })];

    render(<RecentActivityList jobs={jobs} />);

    // Date should be rendered (exact format depends on locale)
    expect(screen.getByText(/Mar 28/)).toBeInTheDocument();
  });
});
