import type { SuggestionRange } from "./types";
import type { LanguageMode, SupportedLanguage } from "../shared/language";

export interface PrefixRange extends SuggestionRange {
  prefix: string;
  language: SupportedLanguage;
}

export interface AppliedSuggestion {
  text: string;
  cursorPosition: number;
}

const currentTokenPattern = /[A-Za-zА-Яа-яЁё'-]+$/u;
const cyrillicLetterPattern = /[А-Яа-яЁё]/u;
const latinLetterPattern = /[A-Za-z]/u;
const ruTokenPattern = /^[А-Яа-яЁё-]+$/u;
const enTokenPattern = /^[A-Za-z'-]+$/u;

export function getAutocompletePrefixRange(
  text: string,
  cursorPosition: number,
  languageMode: LanguageMode = "auto",
): PrefixRange | null {
  const beforeCursor = text.slice(0, cursorPosition);
  const match = beforeCursor.match(currentTokenPattern);

  if (!match || !match[0]) {
    return null;
  }

  const prefix = match[0];
  const language = resolvePrefixLanguage(prefix, languageMode);

  if (!language || !isTokenValidForLanguage(prefix, language)) {
    return null;
  }

  const from = cursorPosition - prefix.length;

  return {
    from,
    to: cursorPosition,
    prefix,
    language,
  };
}

export function resolvePrefixLanguage(
  prefix: string,
  languageMode: LanguageMode,
): SupportedLanguage | null {
  const hasCyrillic = cyrillicLetterPattern.test(prefix);
  const hasLatin = latinLetterPattern.test(prefix);

  if (hasCyrillic && hasLatin) {
    return null;
  }

  if (languageMode === "ru") {
    return hasCyrillic ? "ru" : null;
  }

  if (languageMode === "en") {
    return hasLatin ? "en" : null;
  }

  if (hasCyrillic) {
    return "ru";
  }

  if (hasLatin) {
    return "en";
  }

  return null;
}

function isTokenValidForLanguage(prefix: string, language: SupportedLanguage): boolean {
  return language === "ru" ? ruTokenPattern.test(prefix) : enTokenPattern.test(prefix);
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
