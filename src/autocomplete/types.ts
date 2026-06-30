export type SuggestionKind = "word" | "phrase" | "sentence";

export interface SuggestionRange {
  from: number;
  to: number;
}

export interface SuggestionRequest {
  text: string;
  cursorPosition: number;
  prefix: string;
  replacementRange: SuggestionRange;
  language: "ru";
  limit?: number;
}

export interface Suggestion {
  id: string;
  text: string;
  insertText?: string;
  kind: SuggestionKind;
  source: string;
  replacementRange?: SuggestionRange;
}
