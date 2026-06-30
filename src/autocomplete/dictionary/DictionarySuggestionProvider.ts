import type { SuggestionProvider } from "../SuggestionProvider";
import type { SuggestionKind } from "../types";
import type { Suggestion, SuggestionRequest } from "../types";
import { dictionaryEntries, type DictionaryEntry } from "./dictionaryEntries";
import { rankDictionaryEntries } from "./dictionaryScoring";

interface DictionarySuggestionProviderOptions {
  entries?: readonly DictionaryEntry[];
  limit?: number;
  includeWords?: boolean;
  includePhrases?: boolean;
  includeSentences?: boolean;
  enableNgrams?: boolean;
  minPrefixLength?: number;
  matchMode?: "prefixOnly";
}

export class DictionarySuggestionProvider implements SuggestionProvider {
  readonly name = "Dictionary";
  readonly rankingMode = "provider";
  private readonly entries: readonly DictionaryEntry[];
  private readonly limit: number;
  private readonly enabledKinds: readonly SuggestionKind[];
  private readonly enableNgrams: boolean;
  private readonly minPrefixLength: number;
  private readonly matchMode: "prefixOnly";

  constructor(options: DictionarySuggestionProviderOptions = {}) {
    this.entries = options.entries ?? dictionaryEntries;
    this.limit = options.limit ?? 7;
    this.enabledKinds = getEnabledKinds(options);
    this.enableNgrams = options.enableNgrams ?? false;
    this.minPrefixLength = options.minPrefixLength ?? 2;
    this.matchMode = options.matchMode ?? "prefixOnly";
  }

  async getSuggestions(request: SuggestionRequest): Promise<Suggestion[]> {
    const limit = request.limit ?? this.limit;

    return rankDictionaryEntries(this.entries, request, limit, {
      enabledKinds: this.enabledKinds,
      enableNgrams: this.enableNgrams,
      minPrefixLength: this.minPrefixLength,
      matchMode: this.matchMode,
    }).map(({ entry, replacementRange, insertText }) => ({
      id: `dictionary-${entry.id}`,
      text: entry.text,
      insertText,
      kind: entry.kind,
      source: "dictionary",
      replacementRange,
    }));
  }
}

function getEnabledKinds(
  options: DictionarySuggestionProviderOptions,
): readonly SuggestionKind[] {
  const enabledKinds: SuggestionKind[] = [];

  if (options.includeWords ?? true) {
    enabledKinds.push("word");
  }

  if (options.includePhrases ?? true) {
    enabledKinds.push("phrase");
  }

  if (options.includeSentences ?? false) {
    enabledKinds.push("sentence");
  }

  return enabledKinds;
}
