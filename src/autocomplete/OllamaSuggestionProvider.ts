import type { SuggestionProvider } from "./SuggestionProvider";
import type { Suggestion, SuggestionRequest } from "./types";
import type { InferenceAdapter } from "../inference/InferenceAdapter";

export class OllamaSuggestionProvider implements SuggestionProvider {
  readonly name = "ollama";

  constructor(private readonly _inferenceAdapter: InferenceAdapter) {}

  async getSuggestions(request: SuggestionRequest): Promise<Suggestion[]> {
    void request;
    throw new Error("OllamaSuggestionProvider is reserved for MVP 2+.");
  }
}
