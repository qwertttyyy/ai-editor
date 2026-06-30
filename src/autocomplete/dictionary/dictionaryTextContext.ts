import type { SuggestionRange, SuggestionRequest } from "../types";
import type { SupportedLanguage } from "../../shared/language";

export type DictionaryMatchContextKind = "word" | "phrase";

export interface DictionaryMatchContext {
  value: string;
  normalizedValue: string;
  replacementRange: SuggestionRange;
  kind: DictionaryMatchContextKind;
  tokenCount: number;
}

interface DictionaryToken {
  text: string;
  from: number;
  to: number;
}

const tokenPatterns: Record<SupportedLanguage, RegExp> = {
  ru: /[А-Яа-яЁё-]+/gu,
  en: /[A-Za-z'-]+/gu,
};
const maxPhraseTokenCount = 4;

export function getDictionaryMatchContexts(
  request: SuggestionRequest,
): DictionaryMatchContext[] {
  const contexts: DictionaryMatchContext[] = [];

  addContext(
    contexts,
    {
      value: request.prefix,
      replacementRange: request.replacementRange,
      kind: "word",
      tokenCount: 1,
    },
    request.language,
  );

  const tokens = getLanguageTokensBeforeCursor(
    request.text,
    request.cursorPosition,
    request.language,
  );
  const maxTokenCount = Math.min(maxPhraseTokenCount, tokens.length);

  for (let tokenCount = 2; tokenCount <= maxTokenCount; tokenCount += 1) {
    const phraseTokens = tokens.slice(-tokenCount);
    const phraseStart = phraseTokens[0]?.from;

    if (phraseStart === undefined) {
      continue;
    }

    addContext(
      contexts,
      {
        value: request.text.slice(phraseStart, request.cursorPosition),
        replacementRange: {
          from: phraseStart,
          to: request.cursorPosition,
        },
        kind: "phrase",
        tokenCount,
      },
      request.language,
    );
  }

  return contexts;
}

export function normalizeDictionaryText(
  value: string,
  language: SupportedLanguage,
): string {
  return value.trim().replace(/\s+/gu, " ").toLocaleLowerCase(getLocale(language));
}

function addContext(
  contexts: DictionaryMatchContext[],
  context: Omit<DictionaryMatchContext, "normalizedValue">,
  language: SupportedLanguage,
) {
  const normalizedValue = normalizeDictionaryText(context.value, language);

  if (!normalizedValue) {
    return;
  }

  const exists = contexts.some(
    (existingContext) =>
      existingContext.normalizedValue === normalizedValue &&
      existingContext.replacementRange.from === context.replacementRange.from &&
      existingContext.replacementRange.to === context.replacementRange.to,
  );

  if (exists) {
    return;
  }

  contexts.push({
    ...context,
    normalizedValue,
  });
}

function getLanguageTokensBeforeCursor(
  text: string,
  cursorPosition: number,
  language: SupportedLanguage,
): DictionaryToken[] {
  const beforeCursor = text.slice(0, cursorPosition);
  const tokens: DictionaryToken[] = [];
  const tokenPattern = tokenPatterns[language];

  for (const match of beforeCursor.matchAll(tokenPattern)) {
    if (match.index === undefined || !match[0]) {
      continue;
    }

    tokens.push({
      text: match[0],
      from: match.index,
      to: match.index + match[0].length,
    });
  }

  return tokens;
}

function getLocale(language: SupportedLanguage): string {
  return language === "ru" ? "ru-RU" : "en-US";
}
