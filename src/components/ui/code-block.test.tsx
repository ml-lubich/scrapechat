import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { CodeBlock } from "./code-block";

vi.mock("shiki/bundle/web", () => ({
  codeToHtml: vi.fn().mockResolvedValue(
    '<pre class="shiki"><code><span>const x = 1;</span></code></pre>'
  ),
}));

const SAMPLE_CODE = 'const x = 1;\nconsole.log(x);';

describe("CodeBlock", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders label badge and description", () => {
    render(
      <CodeBlock code={SAMPLE_CODE} language="typescript" label="Playwright" description="Generated Script" />
    );

    expect(screen.getByText("Playwright")).toBeInTheDocument();
    expect(screen.getByText("Generated Script")).toBeInTheDocument();
  });

  it("shows plain code as fallback before shiki loads", () => {
    render(
      <CodeBlock code={SAMPLE_CODE} language="typescript" label="Test" />
    );

    const preEl = document.querySelector("pre code");
    expect(preEl?.textContent).toBe(SAMPLE_CODE);
  });

  it("renders highlighted HTML after shiki loads", async () => {
    render(
      <CodeBlock code={SAMPLE_CODE} language="typescript" label="Test" />
    );

    await waitFor(() => {
      expect(screen.getByText("const x = 1;")).toBeInTheDocument();
    });
  });

  it("copies code to clipboard when copy button is clicked", async () => {
    const writeTextSpy = vi.fn().mockResolvedValue(undefined);
    navigator.clipboard.writeText = writeTextSpy;

    render(
      <CodeBlock code={SAMPLE_CODE} language="typescript" label="Test" />
    );

    fireEvent.click(screen.getByRole("button"));

    expect(writeTextSpy).toHaveBeenCalledWith(SAMPLE_CODE);
  });

  it("renders without description when not provided", () => {
    render(
      <CodeBlock code={SAMPLE_CODE} language="typescript" label="Zod" />
    );

    expect(screen.getByText("Zod")).toBeInTheDocument();
    expect(screen.queryByText("Generated Script")).not.toBeInTheDocument();
  });
});
