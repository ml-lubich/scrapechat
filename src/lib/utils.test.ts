import { describe, it, expect } from "vitest";
import { cn, csvEscapeValue, toCsv } from "./utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden", "visible")).toBe("base visible");
  });

  it("deduplicates conflicting tailwind classes", () => {
    expect(cn("px-4", "px-6")).toBe("px-6");
  });

  it("handles undefined and null inputs", () => {
    expect(cn("base", undefined, null, "end")).toBe("base end");
  });

  it("returns empty string with no arguments", () => {
    expect(cn()).toBe("");
  });

  it("merges conflicting tailwind color classes", () => {
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });

  it("handles array inputs", () => {
    expect(cn(["foo", "bar"], "baz")).toBe("foo bar baz");
  });
});

describe("csvEscapeValue", () => {
  it("returns plain values unchanged", () => {
    expect(csvEscapeValue("hello")).toBe("hello");
  });

  it("wraps values containing commas in quotes", () => {
    expect(csvEscapeValue("hello, world")).toBe('"hello, world"');
  });

  it("escapes double quotes by doubling them", () => {
    expect(csvEscapeValue('say "hi"')).toBe('"say ""hi"""');
  });

  it("wraps values containing newlines in quotes", () => {
    expect(csvEscapeValue("line1\nline2")).toBe('"line1\nline2"');
  });

  it("wraps values containing carriage returns in quotes", () => {
    expect(csvEscapeValue("line1\rline2")).toBe('"line1\rline2"');
  });

  it("wraps values containing \\r\\n in quotes", () => {
    expect(csvEscapeValue("line1\r\nline2")).toBe('"line1\r\nline2"');
  });

  it("handles null and undefined", () => {
    expect(csvEscapeValue(null)).toBe("");
    expect(csvEscapeValue(undefined)).toBe("");
  });

  it("converts numbers to strings", () => {
    expect(csvEscapeValue(42)).toBe("42");
  });

  it("handles values with commas, quotes, and newlines combined", () => {
    expect(csvEscapeValue('a "big"\nlist, here')).toBe('"a ""big""\nlist, here"');
  });
});

describe("toCsv", () => {
  it("returns empty string for empty array", () => {
    expect(toCsv([])).toBe("");
  });

  it("generates correct CSV for simple data", () => {
    const data = [
      { name: "Alice", age: 30 },
      { name: "Bob", age: 25 },
    ];
    expect(toCsv(data)).toBe("name,age\nAlice,30\nBob,25");
  });

  it("escapes values with special characters", () => {
    const data = [
      { title: "Hello, World", description: "A \"great\" day" },
    ];
    expect(toCsv(data)).toBe('title,description\n"Hello, World","A ""great"" day"');
  });

  it("handles multiline values correctly", () => {
    const data = [
      { name: "Restaurant A", review: "Great food.\nWill come back!" },
      { name: "Restaurant B", review: "Okay" },
    ];
    const csv = toCsv(data);
    const lines = csv.split("\n");
    // Header + 2 data rows, but row 1 has an embedded newline inside quotes
    expect(lines[0]).toBe("name,review");
    expect(lines[1]).toBe('Restaurant A,"Great food.');
    expect(lines[2]).toBe('Will come back!"');
    expect(lines[3]).toBe("Restaurant B,Okay");
  });

  it("handles null/undefined values", () => {
    const data = [
      { name: "Test", value: null },
    ];
    expect(toCsv(data as Record<string, unknown>[])).toBe("name,value\nTest,");
  });
});
