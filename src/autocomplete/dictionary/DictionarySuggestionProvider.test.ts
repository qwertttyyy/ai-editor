import { describe, expect, it } from "vitest";

import { DictionarySuggestionProvider } from "./DictionarySuggestionProvider";
import type { DictionaryEntry } from "./dictionaryEntries";
import type { SuggestionRequest } from "../types";

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

function makeWordRequest(text: string, prefix: string, limit = 7): SuggestionRequest {
  const cursorPosition = text.length;

  return {
    text,
    cursorPosition,
    prefix,
    replacementRange: {
      from: cursorPosition - prefix.length,
      to: cursorPosition,
    },
    language: "ru",
    limit,
  };
}

describe("DictionarySuggestionProvider", () => {
  it("returns relevant words and phrases for prefix при", async () => {
    const provider = new DictionarySuggestionProvider();
    const result = await provider.getSuggestions(makeRequest("при"));
    const texts = result.map((suggestion) => suggestion.text);

    expect(texts).toContain("привет");
    expect(texts).toContain("приятно");
    expect(texts).toContain("принять");
  });

  it("uses strict prefix matching and does not return unrelated phrases", async () => {
    const provider = new DictionarySuggestionProvider();
    const result = await provider.getSuggestions(makeRequest("про", 10));
    const texts = result.map((suggestion) => suggestion.text);

    expect(texts).toContain("простой");
    expect(texts).toContain("проверка");
    expect(texts).toContain("проблема");
    expect(texts).not.toContain("основная проблема");
    expect(texts).not.toContain("можно проверить");
  });

  it("returns потому что for prefix потому", async () => {
    const provider = new DictionarySuggestionProvider();
    const result = await provider.getSuggestions(makeRequest("потому"));

    expect(result[0]?.text).toBe("потому что");
    expect(result[0]?.insertText).toBe(" что");
  });

  it("returns в связи с for a simple n-gram prefix", async () => {
    const provider = new DictionarySuggestionProvider();
    const result = await provider.getSuggestions(makeWordRequest("в связ", "связ"));

    expect(result[0]?.text).toBe("в связи с");
    expect(result[0]?.replacementRange).toEqual({
      from: 6,
      to: 6,
    });
    expect(result[0]?.insertText).toBe("и с");
  });

  it("does not use n-gram triggers when they are disabled", async () => {
    const provider = new DictionarySuggestionProvider({ enableNgrams: false });
    const result = await provider.getSuggestions(makeRequest("простые грам"));

    expect(result.map((suggestion) => suggestion.text)).not.toContain("простые n-граммы");
  });

  it("keeps phrase completions when the typed text is the phrase prefix", async () => {
    const provider = new DictionarySuggestionProvider();
    const result = await provider.getSuggestions(makeRequest("простые n"));

    expect(result[0]?.text).toBe("простые n-граммы");
    expect(result[0]?.insertText).toBe("-граммы");
  });

  it("ranks a more frequent entry higher for the same prefix", async () => {
    const provider = new DictionarySuggestionProvider({
      entries: [
        entry("rare", "важный редкий вариант", 200),
        entry("frequent", "важный частый вариант", 1),
      ],
    });
    const result = await provider.getSuggestions(makeRequest("важный"));

    expect(result.map((suggestion) => suggestion.text)).toEqual([
      "важный частый вариант",
      "важный редкий вариант",
    ]);
  });

  it("removes duplicates after ranking", async () => {
    const provider = new DictionarySuggestionProvider({
      entries: [
        entry("first", "можно проверить", 1),
        entry("duplicate", "Можно проверить", 2),
        entry("other", "можно сделать", 3),
      ],
    });
    const result = await provider.getSuggestions(makeRequest("можно"));

    expect(result.map((suggestion) => suggestion.text)).toEqual([
      "можно проверить",
      "можно сделать",
    ]);
  });

  it("does not return the exact prefix as a useless completion", async () => {
    const provider = new DictionarySuggestionProvider();
    const result = await provider.getSuggestions(makeRequest("привет"));
    const texts = result.map((suggestion) => suggestion.text);

    expect(texts).not.toContain("привет");
    expect(texts).toContain("приветствие");
  });
});

function entry(id: string, text: string, frequencyRank: number): DictionaryEntry {
  return {
    id,
    text,
    kind: "phrase",
    frequencyRank,
  };
}
