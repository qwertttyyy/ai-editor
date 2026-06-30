import { describe, expect, it } from "vitest";

import { AutocompleteService } from "./AutocompleteService";
import { MockSuggestionProvider } from "./MockSuggestionProvider";
import type { SuggestionProvider } from "./SuggestionProvider";
import {
  applySuggestion,
  getCyrillicPrefixRange,
  getNextSuggestionIndex,
} from "./textContext";
import type { Suggestion, SuggestionRequest } from "./types";

function makeRequest(prefix: string, limit = 7): SuggestionRequest {
  return {
    text: prefix,
    cursorPosition: prefix.length,
    prefix,
    replacementRange: {
      from: 0,
      to: prefix.length,
    },
    language: "ru",
    limit,
  };
}

describe("AutocompleteService", () => {
  it("returns mock suggestions for Russian prefixes", async () => {
    const service = new AutocompleteService(new MockSuggestionProvider());
    const result = await service.getSuggestions(makeRequest("при"));

    expect(result.status).toBe("available");
    expect(result.suggestions.map((suggestion) => suggestion.text)).toEqual([
      "привет",
      "приятный день",
    ]);
  });

  it("filters and keeps a stable ranked order", async () => {
    const service = new AutocompleteService(new MockSuggestionProvider());
    const result = await service.getSuggestions(makeRequest("про"));

    expect(result.suggestions.map((suggestion) => suggestion.text)).toEqual([
      "продолжить мысль",
      "можно продолжить",
    ]);
  });

  it("ranks, deduplicates, and limits primary provider suggestions", async () => {
    class PrimaryProvider implements SuggestionProvider {
      readonly name = "primary";

      async getSuggestions(): Promise<Suggestion[]> {
        return [
          makeSuggestion("primary-include-a", "мой привет"),
          makeSuggestion("primary-start-a", "приветствие"),
          makeSuggestion("primary-start-a-duplicate", " Приветствие "),
          makeSuggestion("primary-start-b", "приятный день"),
          makeSuggestion("primary-include-b", "сказать привет"),
          makeSuggestion("primary-miss", "спасибо"),
        ];
      }
    }

    const service = new AutocompleteService(new PrimaryProvider(), { limit: 3 });
    const result = await service.getSuggestions(makeRequest("при", 3));

    expect(result.status).toBe("available");
    expect(result.provider).toBe("primary");
    expect(result.suggestions.map((suggestion) => suggestion.text)).toEqual([
      "приветствие",
      "приятный день",
      "мой привет",
    ]);
  });

  it("uses fallback suggestions when the primary provider has no matches", async () => {
    const service = new AutocompleteService(new MockSuggestionProvider());
    const result = await service.getSuggestions(makeRequest("яяя"));

    expect(result.status).toBe("fallback");
    expect(result.suggestions).toHaveLength(7);
    expect(result.suggestions[0]?.source).toBe("mock");
  });

  it("uses fallback suggestions when the primary provider fails", async () => {
    class FailingProvider implements SuggestionProvider {
      readonly name = "failing";

      async getSuggestions(): Promise<never> {
        throw new Error("provider failed");
      }
    }

    const service = new AutocompleteService(new FailingProvider());
    const result = await service.getSuggestions(makeRequest("при"));

    expect(result.status).toBe("fallback");
    expect(result.suggestions[0]?.text).toBe("привет");
  });
});

function makeSuggestion(id: string, text: string): Suggestion {
  return {
    id,
    text,
    kind: "phrase",
    source: "test",
  };
}

describe("text autocomplete helpers", () => {
  it("detects the Russian prefix before the cursor", () => {
    expect(getCyrillicPrefixRange("Это при", 7)).toEqual({
      from: 4,
      to: 7,
      prefix: "при",
    });
  });

  it("applies the selected suggestion to the active prefix range", () => {
    expect(applySuggestion("Это при", { from: 4, to: 7 }, "привет")).toEqual({
      text: "Это привет",
      cursorPosition: 10,
    });
  });

  it("cycles selected suggestions with keyboard navigation", () => {
    expect(getNextSuggestionIndex(0, 3, "next")).toBe(1);
    expect(getNextSuggestionIndex(2, 3, "next")).toBe(0);
    expect(getNextSuggestionIndex(0, 3, "previous")).toBe(2);
  });
});
