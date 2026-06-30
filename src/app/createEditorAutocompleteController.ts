import { EditorAutocompleteController } from "./EditorAutocompleteController";
import { autocompleteConfig, type AutocompleteConfig } from "./autocompleteConfig";
import { createAutocompleteService } from "./createAutocompleteService";

export function createEditorAutocompleteController(
  config: AutocompleteConfig = autocompleteConfig,
): EditorAutocompleteController {
  return new EditorAutocompleteController(createAutocompleteService(config), {
    languageMode: config.languageMode,
    limit: config.dictionary.maxSuggestions,
  });
}
