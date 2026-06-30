import { MockSuggestionProvider } from "./MockSuggestionProvider";
import type { SuggestionProvider } from "./SuggestionProvider";
import { rankSuggestions } from "./ranking";
import type { Suggestion, SuggestionRequest } from "./types";

export type SuggestionResultStatus = "idle" | "available" | "empty" | "error" | "fallback";

export interface SuggestionResult {
  suggestions: Suggestion[];
  status: SuggestionResultStatus;
  provider: string;
}

interface AutocompleteServiceOptions {
  limit?: number;
  fallbackProvider?: SuggestionProvider;
}

export class AutocompleteService {
  private readonly provider: SuggestionProvider;
  private readonly fallbackProvider: SuggestionProvider;
  private readonly limit: number;

  constructor(provider: SuggestionProvider, options: AutocompleteServiceOptions = {}) {
    this.provider = provider;
    this.limit = options.limit ?? 7;
    this.fallbackProvider =
      options.fallbackProvider ??
      new MockSuggestionProvider({ fallbackToDefaultSuggestions: true });
  }

  async getSuggestions(request: SuggestionRequest): Promise<SuggestionResult> {
    if (!request.prefix.trim()) {
      return {
        suggestions: [],
        status: "idle",
        provider: this.provider.name,
      };
    }

    try {
      const suggestions = await this.provider.getSuggestions(request);
      const rankedSuggestions = rankSuggestions(
        suggestions,
        request,
        request.limit ?? this.limit,
      );

      if (rankedSuggestions.length > 0) {
        return {
          suggestions: rankedSuggestions,
          status: "available",
          provider: this.provider.name,
        };
      }

      return this.getFallbackSuggestions(request, "empty");
    } catch {
      return this.getFallbackSuggestions(request, "error");
    }
  }

  private async getFallbackSuggestions(
    request: SuggestionRequest,
    reason: "empty" | "error",
  ): Promise<SuggestionResult> {
    try {
      const limit = request.limit ?? this.limit;
      const fallbackSuggestions = await this.fallbackProvider.getSuggestions(request);
      const rankedFallbackSuggestions = rankSuggestions(
        fallbackSuggestions,
        request,
        limit,
      );
      const safeFallbackSuggestions =
        rankedFallbackSuggestions.length > 0
          ? rankedFallbackSuggestions
          : fallbackSuggestions.slice(0, limit);

      if (safeFallbackSuggestions.length > 0) {
        return {
          suggestions: safeFallbackSuggestions,
          status: "fallback",
          provider: this.fallbackProvider.name,
        };
      }
    } catch {
      return {
        suggestions: [],
        status: "error",
        provider: this.fallbackProvider.name,
      };
    }

    return {
      suggestions: [],
      status: reason,
      provider: this.fallbackProvider.name,
    };
  }
}
