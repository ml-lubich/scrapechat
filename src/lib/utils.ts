import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Escape a value for CSV output (RFC 4180 compliant).
 * Wraps in double quotes if the value contains commas, quotes, newlines, or carriage returns.
 */
export function csvEscapeValue(value: unknown): string {
  const str = String(value ?? "");
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Convert an array of objects to a CSV string.
 * Columns are derived from the first row's keys.
 */
export function toCsv(data: Record<string, unknown>[]): string {
  if (data.length === 0) return "";
  const columns = Object.keys(data[0]);
  const header = columns.join(",");
  const rows = data.map((row) =>
    columns.map((col) => csvEscapeValue(row[col])).join(",")
  );
  return [header, ...rows].join("\n");
}
