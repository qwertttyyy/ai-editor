export interface AutocompleteConfig {
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
