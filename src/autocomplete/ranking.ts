import type { Suggestion, SuggestionRequest } from "./types";

export function rankSuggestions(
  suggestions: Suggestion[],
  request: SuggestionRequest,
  limit: number,
): Suggestion[] {
  const normalizedPrefix = normalize(request.prefix);
  const seen = new Set<string>();

  return suggestions
    .map((suggestion, index) => {
      const activePrefix = getSuggestionPrefix(suggestion, request, normalizedPrefix);

      return {
        suggestion,
        index,
        score: scoreSuggestion(suggestion.text, activePrefix),
      };
    })
    .filter(({ suggestion, score }) => {
      const key = normalize(suggestion.text);
      if (seen.has(key) || score === 0) {
        return false;
      }

      seen.add(key);
      return true;
    })
    .sort((left, right) => right.score - left.score || left.index - right.index)
    .slice(0, limit)
    .map(({ suggestion }) => suggestion);
}

export function dedupeAndLimitSuggestions(
  suggestions: Suggestion[],
  limit: number,
): Suggestion[] {
  const seen = new Set<string>();
  const result: Suggestion[] = [];

  for (const suggestion of suggestions) {
    const key = normalize(suggestion.text);

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    result.push(suggestion);

    if (result.length >= limit) {
      break;
    }
  }

  return result;
}

function scoreSuggestion(text: string, normalizedPrefix: string) {
  if (!normalizedPrefix) {
    return 1;
  }

  const normalizedText = normalize(text);

  if (normalizedText === normalizedPrefix) {
    return 0;
  }

  if (normalizedText.startsWith(normalizedPrefix)) {
    return 3;
  }

  if (normalizedText.includes(normalizedPrefix)) {
    return 2;
  }

  return 0;
}

function normalize(value: string) {
  return value.trim().toLocaleLowerCase("ru-RU");
}

function getSuggestionPrefix(
  suggestion: Suggestion,
  request: SuggestionRequest,
  fallbackPrefix: string,
) {
  const range = suggestion.replacementRange;

  if (!range) {
    return fallbackPrefix;
  }

  if (range.from < 0 || range.to < range.from || range.to > request.text.length) {
    return fallbackPrefix;
  }

  return normalize(request.text.slice(range.from, range.to));
}
