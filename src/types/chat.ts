export type MessageRole = "user" | "assistant";

export type MessageStatus =
  | "sending"
  | "generating"
  | "executing"
  | "complete"
  | "error";

export interface ScrapedResult {
  data: Record<string, unknown>[];
  itemsCount: number;
  schema?: string;
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  status?: MessageStatus;
  generatedScript?: string;
  zodSchema?: string;
  results?: ScrapedResult;
  error?: string;
}
