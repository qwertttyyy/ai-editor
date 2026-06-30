import type { SuggestionKind, SuggestionRange, SuggestionRequest } from "../types";
import type { DictionaryEntry } from "./dictionaryEntries";
import {
  getDictionaryMatchContexts,
  normalizeDictionaryText,
  type DictionaryMatchContext,
} from "./dictionaryTextContext";

export interface DictionaryScoringOptions {
  enabledKinds: readonly SuggestionKind[];
  enableNgrams: boolean;
  minPrefixLength: number;
  matchMode: "prefixOnly";
}

export interface ScoredDictionaryEntry {
  entry: DictionaryEntry;
  score: number;
  replacementRange: SuggestionRange;
  insertText: string;
}

interface IndexedScoredDictionaryEntry extends ScoredDictionaryEntry {
  index: number;
}

const prefixMatchScore = 100_000;
const triggerMatchScore = 75_000;
const phraseContextBoost = 2_000;
const tokenContextBoost = 250;
const triggerBoost = 1_000;
const maxFrequencyScore = 10_000;

export function rankDictionaryEntries(
  entries: readonly DictionaryEntry[],
  request: SuggestionRequest,
  limit: number,
  options: DictionaryScoringOptions,
): ScoredDictionaryEntry[] {
  const contexts = getDictionaryMatchContexts(request).filter(
    (context) =>
      context.normalizedValue.length >= options.minPrefixLength &&
      (context.kind === "word" || canUsePhraseContext(options)),
  );
  const seen = new Set<string>();

  return entries
    .map((entry, index): IndexedScoredDictionaryEntry | null => {
      if (!options.enabledKinds.includes(entry.kind)) {
        return null;
      }

      const scoredEntry = scoreDictionaryEntry(entry, contexts, options);

      if (!scoredEntry) {
        return null;
      }

      return {
        ...scoredEntry,
        index,
      };
    })
    .filter((entry): entry is IndexedScoredDictionaryEntry => entry !== null)
    .sort(
      (left, right) =>
        right.score - left.score ||
        left.entry.frequencyRank - right.entry.frequencyRank ||
        left.index - right.index,
    )
    .filter(({ entry }) => {
      const key = normalizeDictionaryText(entry.text);

      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    })
    .slice(0, limit)
    .map(({ entry, replacementRange, insertText, score }) => ({
      entry,
      replacementRange,
      insertText,
      score,
    }));
}

function scoreDictionaryEntry(
  entry: DictionaryEntry,
  contexts: readonly DictionaryMatchContext[],
  options: DictionaryScoringOptions,
): ScoredDictionaryEntry | null {
  const normalizedText = normalizeDictionaryText(entry.text);
  let bestScore = 0;
  let bestContext: DictionaryMatchContext | null = null;

  for (const context of contexts) {
    const textScore = scoreTextMatch(
      normalizedText,
      context.normalizedValue,
      options.matchMode,
    );
    const normalizedTriggers = entry.triggers?.map(normalizeDictionaryText) ?? [];
    const currentTriggerScore = options.enableNgrams
      ? scoreTriggerMatch(normalizedTriggers, context.normalizedValue)
      : 0;
    const matchScore = Math.max(textScore, currentTriggerScore);

    if (matchScore === 0) {
      continue;
    }

    const currentScore =
      matchScore +
      getContextBoost(context) +
      getFrequencyScore(entry.frequencyRank) +
      (currentTriggerScore > 0 ? triggerBoost : 0);

    if (currentScore > bestScore) {
      bestScore = currentScore;
      bestContext = context;
    }
  }

  if (!bestContext) {
    return null;
  }

  return {
    entry,
    score: bestScore,
    replacementRange: {
      from: bestContext.replacementRange.to,
      to: bestContext.replacementRange.to,
    },
    insertText: entry.text.slice(bestContext.value.length),
  };
}

function scoreTextMatch(
  normalizedText: string,
  normalizedPrefix: string,
  matchMode: DictionaryScoringOptions["matchMode"],
): number {
  void matchMode;

  if (normalizedText === normalizedPrefix) {
    return 0;
  }

  if (normalizedText.startsWith(normalizedPrefix)) {
    return prefixMatchScore;
  }

  return 0;
}

function scoreTriggerMatch(
  normalizedTriggers: readonly string[],
  normalizedPrefix: string,
): number {
  for (const normalizedTrigger of normalizedTriggers) {
    if (
      normalizedTrigger === normalizedPrefix ||
      normalizedTrigger.startsWith(normalizedPrefix) ||
      normalizedPrefix.startsWith(normalizedTrigger)
    ) {
      return triggerMatchScore;
    }
  }

  return 0;
}

function getContextBoost(context: DictionaryMatchContext): number {
  if (context.kind === "word") {
    return 0;
  }

  return phraseContextBoost + context.tokenCount * tokenContextBoost;
}

function getFrequencyScore(frequencyRank: number): number {
  return Math.max(0, maxFrequencyScore - frequencyRank);
}

function canUsePhraseContext(options: DictionaryScoringOptions): boolean {
  return (
    options.enableNgrams ||
    options.enabledKinds.includes("phrase") ||
    options.enabledKinds.includes("sentence")
  );
}
