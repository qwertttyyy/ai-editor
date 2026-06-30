import type { SuggestionProvider } from "./SuggestionProvider";
import { rankSuggestions } from "./ranking";
import type { Suggestion, SuggestionRequest } from "./types";

interface MockSuggestionProviderOptions {
  fallbackToDefaultSuggestions?: boolean;
}

const mockSuggestions: Suggestion[] = [
  {
    id: "mock-privet",
    text: "привет",
    kind: "word",
    source: "mock",
  },
  {
    id: "mock-priyatnyy-den",
    text: "приятный день",
    kind: "phrase",
    source: "mock",
  },
  {
    id: "mock-prodolzhit-mysl",
    text: "продолжить мысль",
    kind: "phrase",
    source: "mock",
  },
  {
    id: "mock-spasibo",
    text: "спасибо",
    kind: "word",
    source: "mock",
  },
  {
    id: "mock-vazhnaya-mysl",
    text: "важная мысль",
    kind: "phrase",
    source: "mock",
  },
  {
    id: "mock-mozhno-prodolzhit",
    text: "можно продолжить",
    kind: "phrase",
    source: "mock",
  },
  {
    id: "mock-eto-horoshee-nachalo",
    text: "это хорошее начало",
    kind: "sentence",
    source: "mock",
  },
];

export class MockSuggestionProvider implements SuggestionProvider {
  readonly name = "mock";
  private readonly fallbackToDefaultSuggestions: boolean;

  constructor(options: MockSuggestionProviderOptions = {}) {
    this.fallbackToDefaultSuggestions = options.fallbackToDefaultSuggestions ?? false;
  }

  async getSuggestions(request: SuggestionRequest): Promise<Suggestion[]> {
    const limit = request.limit ?? 7;
    const rankedSuggestions = rankSuggestions(mockSuggestions, request, limit);

    if (rankedSuggestions.length > 0 || !this.fallbackToDefaultSuggestions) {
      return rankedSuggestions;
    }

    return mockSuggestions.slice(0, limit);
  }
}
