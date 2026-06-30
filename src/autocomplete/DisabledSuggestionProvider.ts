import type { SuggestionProvider } from "./SuggestionProvider";
import type { Suggestion } from "./types";

export class DisabledSuggestionProvider implements SuggestionProvider {
  readonly name = "Disabled";

  async getSuggestions(): Promise<Suggestion[]> {
    return [];
  }
}
