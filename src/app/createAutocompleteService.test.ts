import { describe, expect, it } from "vitest";

import type { SuggestionRequest } from "../autocomplete/types";
import { createAutocompleteService } from "./createAutocompleteService";

describe("createAutocompleteService", () => {
  it("uses the dictionary provider in the production autocomplete path", async () => {
    const service = createAutocompleteService();
    const result = await service.getSuggestions(makeRequest("при"));
    const texts = result.suggestions.map((suggestion) => suggestion.text);

    expect(result.status).toBe("available");
    expect(result.provider).toBe("Dictionary");
    expect(texts).toContain("привет");
    expect(texts).toContain("приятно");
  });

  it("does not show trigger-only phrase suggestions in the production path", async () => {
    const service = createAutocompleteService();
    const result = await service.getSuggestions(makeRequest("простые грам"));

    expect(result.provider).toBe("Dictionary");
    expect(result.suggestions.map((suggestion) => suggestion.text)).not.toContain(
      "простые n-граммы",
    );
  });

  it("keeps phrase prefix suggestions in the production path", async () => {
    const service = createAutocompleteService();
    const result = await service.getSuggestions(makeRequest("простые n"));

    expect(result.status).toBe("available");
    expect(result.provider).toBe("Dictionary");
    expect(result.suggestions[0]).toMatchObject({
      text: "простые n-граммы",
      insertText: "-граммы",
      replacementRange: {
        from: 9,
        to: 9,
      },
    });
  });

  it("keeps dictionary replacement ranges for phrase completions", async () => {
    const service = createAutocompleteService();
    const result = await service.getSuggestions(makeRequest("в связ"));

    expect(result.suggestions[0]).toMatchObject({
      text: "в связи с",
      insertText: "и с",
      replacementRange: {
        from: 6,
        to: 6,
      },
    });
  });

  it("can disable dictionary suggestions through code config", async () => {
    const service = createAutocompleteService({
      dictionary: {
        enabled: false,
        includeWords: true,
        includePhrases: true,
        includeSentences: false,
        enableNgrams: false,
        maxSuggestions: 5,
        minPrefixLength: 2,
        matchMode: "prefixOnly",
      },
    });
    const result = await service.getSuggestions(makeRequest("при"));

    expect(result.status).toBe("empty");
    expect(result.provider).toBe("Disabled");
    expect(result.suggestions).toEqual([]);
  });
});

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
