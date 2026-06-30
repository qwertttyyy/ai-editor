import type { SuggestionProvider } from "./SuggestionProvider";
import { dedupeAndLimitSuggestions, rankSuggestions } from "./ranking";
import type { Suggestion, SuggestionRequest } from "./types";

export type SuggestionResultStatus =
  "idle" | "available" | "empty" | "error" | "fallback";

export interface SuggestionResult {
  suggestions: Suggestion[];
  status: SuggestionResultStatus;
  provider: string;
}

interface AutocompleteServiceOptions {
  limit?: number;
  fallbackProvider?: SuggestionProvider;
  fallbackOnEmpty?: boolean;
  fallbackOnError?: boolean;
}

export class AutocompleteService {
  private readonly provider: SuggestionProvider;
  private readonly fallbackProvider?: SuggestionProvider;
  private readonly fallbackOnEmpty: boolean;
  private readonly fallbackOnError: boolean;
  private readonly limit: number;

  constructor(provider: SuggestionProvider, options: AutocompleteServiceOptions = {}) {
    this.provider = provider;
    this.limit = options.limit ?? 7;
    this.fallbackProvider = options.fallbackProvider;
    this.fallbackOnEmpty = options.fallbackOnEmpty ?? false;
    this.fallbackOnError = options.fallbackOnError ?? Boolean(options.fallbackProvider);
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
      const rankedSuggestions = this.prepareSuggestions(
        this.provider,
        suggestions,
        request,
      );

      if (rankedSuggestions.length > 0) {
        return {
          suggestions: rankedSuggestions,
          status: "available",
          provider: this.provider.name,
        };
      }

      if (this.fallbackOnEmpty) {
        return this.getFallbackSuggestions(request, "empty");
      }

      return {
        suggestions: [],
        status: "empty",
        provider: this.provider.name,
      };
    } catch {
      if (!this.fallbackOnError) {
        return {
          suggestions: [],
          status: "error",
          provider: this.provider.name,
        };
      }

      return this.getFallbackSuggestions(request, "error");
    }
  }

  private async getFallbackSuggestions(
    request: SuggestionRequest,
    reason: "empty" | "error",
  ): Promise<SuggestionResult> {
    if (!this.fallbackProvider) {
      return {
        suggestions: [],
        status: reason,
        provider: this.provider.name,
      };
    }

    try {
      const limit = request.limit ?? this.limit;
      const fallbackSuggestions = await this.fallbackProvider.getSuggestions(request);
      const rankedFallbackSuggestions = this.prepareSuggestions(
        this.fallbackProvider,
        fallbackSuggestions,
        request,
        limit,
      );

      if (rankedFallbackSuggestions.length > 0) {
        return {
          suggestions: rankedFallbackSuggestions,
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

  private prepareSuggestions(
    provider: SuggestionProvider,
    suggestions: Suggestion[],
    request: SuggestionRequest,
    limit = request.limit ?? this.limit,
  ): Suggestion[] {
    if (provider.rankingMode === "provider") {
      return dedupeAndLimitSuggestions(suggestions, limit);
    }

    return rankSuggestions(suggestions, request, limit);
  }
}
