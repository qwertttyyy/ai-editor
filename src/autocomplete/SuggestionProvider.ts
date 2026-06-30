import type { Suggestion, SuggestionRequest } from "./types";

export type SuggestionRankingMode = "service" | "provider";

export interface SuggestionProvider {
  readonly name: string;
  readonly rankingMode?: SuggestionRankingMode;
  getSuggestions(request: SuggestionRequest): Promise<Suggestion[]>;
}
