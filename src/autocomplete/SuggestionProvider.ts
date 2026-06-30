import type { Suggestion, SuggestionRequest } from "./types";

export interface SuggestionProvider {
  readonly name: string;
  getSuggestions(request: SuggestionRequest): Promise<Suggestion[]>;
}
