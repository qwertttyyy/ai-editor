import type { Suggestion, SuggestionRequest } from "./types";

export function rankSuggestions(
  suggestions: Suggestion[],
  request: SuggestionRequest,
  limit: number,
): Suggestion[] {
  const normalizedPrefix = normalize(request.prefix);
  const seen = new Set<string>();

  return suggestions
    .map((suggestion, index) => ({
      suggestion,
      index,
      score: scoreSuggestion(suggestion.text, normalizedPrefix),
    }))
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

function scoreSuggestion(text: string, normalizedPrefix: string) {
  if (!normalizedPrefix) {
    return 1;
  }

  const normalizedText = normalize(text);

  if (normalizedText === normalizedPrefix) {
    return 4;
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
