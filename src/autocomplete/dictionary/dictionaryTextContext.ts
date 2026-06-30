import type { SuggestionRange, SuggestionRequest } from "../types";

export type DictionaryMatchContextKind = "word" | "phrase";

export interface DictionaryMatchContext {
  value: string;
  normalizedValue: string;
  replacementRange: SuggestionRange;
  kind: DictionaryMatchContextKind;
  tokenCount: number;
}

interface CyrillicToken {
  text: string;
  from: number;
  to: number;
}

const cyrillicTokenPattern = /[А-Яа-яЁё-]+/gu;
const maxPhraseTokenCount = 4;

export function getDictionaryMatchContexts(
  request: SuggestionRequest,
): DictionaryMatchContext[] {
  const contexts: DictionaryMatchContext[] = [];

  addContext(contexts, {
    value: request.prefix,
    replacementRange: request.replacementRange,
    kind: "word",
    tokenCount: 1,
  });

  const tokens = getCyrillicTokensBeforeCursor(request.text, request.cursorPosition);
  const maxTokenCount = Math.min(maxPhraseTokenCount, tokens.length);

  for (let tokenCount = 2; tokenCount <= maxTokenCount; tokenCount += 1) {
    const phraseTokens = tokens.slice(-tokenCount);
    const phraseStart = phraseTokens[0]?.from;

    if (phraseStart === undefined) {
      continue;
    }

    addContext(contexts, {
      value: request.text.slice(phraseStart, request.cursorPosition),
      replacementRange: {
        from: phraseStart,
        to: request.cursorPosition,
      },
      kind: "phrase",
      tokenCount,
    });
  }

  return contexts;
}

export function normalizeDictionaryText(value: string): string {
  return value.trim().replace(/\s+/gu, " ").toLocaleLowerCase("ru-RU");
}

function addContext(
  contexts: DictionaryMatchContext[],
  context: Omit<DictionaryMatchContext, "normalizedValue">,
) {
  const normalizedValue = normalizeDictionaryText(context.value);

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

function getCyrillicTokensBeforeCursor(
  text: string,
  cursorPosition: number,
): CyrillicToken[] {
  const beforeCursor = text.slice(0, cursorPosition);
  const tokens: CyrillicToken[] = [];

  for (const match of beforeCursor.matchAll(cyrillicTokenPattern)) {
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
