"use client";

import { ScrapedResult } from "@/types/chat";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, Clipboard, Save } from "lucide-react";
import { useState } from "react";
import { toCsv } from "@/lib/utils";

interface ResultsTableProps {
  results: ScrapedResult;
  onSaveRecipe?: () => void;
}

export function ResultsTable({ results, onSaveRecipe }: ResultsTableProps) {
  const [copied, setCopied] = useState(false);
  const { data } = results;

  if (!data || data.length === 0) return null;

  const columns = Object.keys(data[0]);

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "scraped-data.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportCSV = () => {
    const csv = toCsv(data as Record<string, unknown>[]);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "scraped-data.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-[var(--muted-foreground)]">
          Showing {data.length} result{data.length !== 1 ? "s" : ""}
        </span>
        <div className="flex items-center gap-2">
          {onSaveRecipe && (
            <Button variant="outline" size="sm" onClick={onSaveRecipe} className="gap-1.5">
              <Save className="h-3.5 w-3.5" />
              Save Recipe
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={copyToClipboard} className="gap-1.5">
            <Clipboard className="h-3.5 w-3.5" />
            {copied ? "Copied!" : "Copy"}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Download className="h-3.5 w-3.5" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={exportJSON}>
                Export as JSON
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportCSV}>
                Export as CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="rounded-lg border border-[var(--border)] overflow-x-auto overflow-y-auto max-h-96 -mx-px">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col} className="whitespace-nowrap font-medium">
                  {col}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, i) => (
              <TableRow key={i}>
                {columns.map((col) => (
                  <TableCell key={col} className="max-w-xs truncate">
                    {String(row[col] ?? "")}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
