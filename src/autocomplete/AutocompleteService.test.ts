import { describe, expect, it } from "vitest";

import { AutocompleteService } from "./AutocompleteService";
import type { SuggestionProvider } from "./SuggestionProvider";
import {
  applySuggestion,
  getAutocompletePrefixRange,
  getNextSuggestionIndex,
} from "./textContext";
import type { Suggestion, SuggestionRequest } from "./types";
import type { SupportedLanguage } from "../shared/language";

function makeRequest(
  prefix: string,
  limit = 7,
  language: SupportedLanguage = "ru",
): SuggestionRequest {
  return {
    text: prefix,
    cursorPosition: prefix.length,
    prefix,
    replacementRange: {
      from: 0,
      to: prefix.length,
    },
    language,
    limit,
  };
}

describe("AutocompleteService", () => {
  it("filters and keeps a stable ranked order", async () => {
    const service = new AutocompleteService(
      new StaticProvider("primary", [
        makeSuggestion("primary-a", "продолжить мысль"),
        makeSuggestion("primary-b", "можно продолжить"),
        makeSuggestion("primary-c", "спасибо"),
      ]),
    );
    const result = await service.getSuggestions(makeRequest("про"));

    expect(result.suggestions.map((suggestion) => suggestion.text)).toEqual([
      "продолжить мысль",
      "можно продолжить",
    ]);
  });

  it("ranks, deduplicates, and limits primary provider suggestions", async () => {
    const service = new AutocompleteService(
      new StaticProvider("primary", [
        makeSuggestion("primary-include-a", "мой привет"),
        makeSuggestion("primary-start-a", "приветствие"),
        makeSuggestion("primary-start-a-duplicate", " Приветствие "),
        makeSuggestion("primary-start-b", "приятный день"),
        makeSuggestion("primary-include-b", "сказать привет"),
        makeSuggestion("primary-miss", "спасибо"),
      ]),
      { limit: 3 },
    );
    const result = await service.getSuggestions(makeRequest("при", 3));

    expect(result.status).toBe("available");
    expect(result.provider).toBe("primary");
    expect(result.suggestions.map((suggestion) => suggestion.text)).toEqual([
      "приветствие",
      "приятный день",
      "мой привет",
    ]);
  });

  it("preserves provider-ranked suggestions that do not match generic prefix scoring", async () => {
    const service = new AutocompleteService(
      new StaticProvider(
        "primary",
        [makeSuggestion("primary-trigger", "простые n-граммы")],
        "provider",
      ),
    );
    const result = await service.getSuggestions(makeRequest("простые грам"));

    expect(result.status).toBe("available");
    expect(result.suggestions.map((suggestion) => suggestion.text)).toEqual([
      "простые n-граммы",
    ]);
  });

  it("does not call fallback provider when primary has no matches by default", async () => {
    const service = new AutocompleteService(
      new StaticProvider("primary", [makeSuggestion("primary-a", "спасибо")]),
      {
        fallbackProvider: new FailingProvider("fallback"),
      },
    );
    const result = await service.getSuggestions(makeRequest("яяя"));

    expect(result.status).toBe("empty");
    expect(result.provider).toBe("primary");
    expect(result.suggestions).toEqual([]);
  });

  it("uses fallback provider when the primary provider fails and fallbackOnError is enabled", async () => {
    const service = new AutocompleteService(new FailingProvider("primary"), {
      fallbackOnError: true,
      fallbackProvider: new StaticProvider("fallback", [
        makeSuggestion("fallback-a", "привет"),
      ]),
    });
    const result = await service.getSuggestions(makeRequest("при"));

    expect(result.status).toBe("fallback");
    expect(result.provider).toBe("fallback");
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

class StaticProvider implements SuggestionProvider {
  constructor(
    readonly name: string,
    private readonly suggestions: readonly Suggestion[],
    readonly rankingMode: SuggestionProvider["rankingMode"] = "service",
  ) {}

  async getSuggestions(): Promise<Suggestion[]> {
    return [...this.suggestions];
  }
}

class FailingProvider implements SuggestionProvider {
  constructor(readonly name: string) {}

  async getSuggestions(): Promise<never> {
    throw new Error("provider failed");
  }
}

describe("text autocomplete helpers", () => {
  it("detects the Russian prefix before the cursor", () => {
    expect(getAutocompletePrefixRange("Это при", 7)).toEqual({
      from: 4,
      to: 7,
      prefix: "при",
      language: "ru",
    });
  });

  it("detects English prefix in auto language mode", () => {
    expect(getAutocompletePrefixRange("This bec", 8)).toEqual({
      from: 5,
      to: 8,
      prefix: "bec",
      language: "en",
    });
  });

  it("does not mix Russian and English letters inside one token", () => {
    expect(getAutocompletePrefixRange("abc-при", 7)).toBeNull();
  });

  it("does not return a prefix when explicit language mode does not match", () => {
    expect(getAutocompletePrefixRange("This bec", 8, "ru")).toBeNull();
    expect(getAutocompletePrefixRange("Это при", 7, "en")).toBeNull();
  });

  it("keeps English apostrophe and hyphen inside a token", () => {
    expect(getAutocompletePrefixRange("don't re-enter", 14, "en")).toEqual({
      from: 6,
      to: 14,
      prefix: "re-enter",
      language: "en",
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
