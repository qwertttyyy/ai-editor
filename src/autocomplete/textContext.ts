import type { SuggestionRange } from "./types";

export interface PrefixRange extends SuggestionRange {
  prefix: string;
}

export interface AppliedSuggestion {
  text: string;
  cursorPosition: number;
}

const cyrillicPrefixPattern = /[А-Яа-яЁё-]+$/u;

export function getCyrillicPrefixRange(
  text: string,
  cursorPosition: number,
): PrefixRange | null {
  const beforeCursor = text.slice(0, cursorPosition);
  const match = beforeCursor.match(cyrillicPrefixPattern);

  if (!match || !match[0]) {
    return null;
  }

  const prefix = match[0];
  const from = cursorPosition - prefix.length;

  return {
    from,
    to: cursorPosition,
    prefix,
  };
}

export function applySuggestion(
  text: string,
  range: SuggestionRange,
  suggestionText: string,
): AppliedSuggestion {
  const nextText = `${text.slice(0, range.from)}${suggestionText}${text.slice(range.to)}`;

  return {
    text: nextText,
    cursorPosition: range.from + suggestionText.length,
  };
}

export function getNextSuggestionIndex(
  currentIndex: number,
  count: number,
  direction: "next" | "previous",
) {
  if (count <= 0) {
    return 0;
  }

  const delta = direction === "next" ? 1 : -1;
  return (currentIndex + delta + count) % count;
}
