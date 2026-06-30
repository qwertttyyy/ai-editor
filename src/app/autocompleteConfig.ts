import type { LanguageMode } from "../shared/language";

export interface AutocompleteConfig {
  languageMode: LanguageMode;
  dictionary: {
    enabled: boolean;
    includeWords: boolean;
    includePhrases: boolean;
    includeSentences: boolean;
    enableNgrams: boolean;
    maxSuggestions: number;
    minPrefixLength: number;
    matchMode: "prefixOnly";
  };
}

export const autocompleteConfig: AutocompleteConfig = {
  languageMode: "auto",
  dictionary: {
    enabled: true,
    includeWords: true,
    includePhrases: true,
    includeSentences: false,
    enableNgrams: false,
    maxSuggestions: 5,
    minPrefixLength: 2,
    matchMode: "prefixOnly",
  },
};
