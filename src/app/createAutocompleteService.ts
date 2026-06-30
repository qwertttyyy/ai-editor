import { AutocompleteService } from "../autocomplete/AutocompleteService";
import { DisabledSuggestionProvider } from "../autocomplete/DisabledSuggestionProvider";
import { DictionarySuggestionProvider } from "../autocomplete/dictionary/DictionarySuggestionProvider";
import { autocompleteConfig, type AutocompleteConfig } from "./autocompleteConfig";

export function createAutocompleteService(
  config: AutocompleteConfig = autocompleteConfig,
): AutocompleteService {
  if (!config.dictionary.enabled) {
    return new AutocompleteService(new DisabledSuggestionProvider(), {
      limit: 0,
    });
  }

  return new AutocompleteService(new DictionarySuggestionProvider(config.dictionary), {
    limit: config.dictionary.maxSuggestions,
  });
}
