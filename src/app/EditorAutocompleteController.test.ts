import { describe, expect, it } from "vitest";

import { AutocompleteService } from "../autocomplete/AutocompleteService";
import type { SuggestionProvider } from "../autocomplete/SuggestionProvider";
import type { Suggestion, SuggestionRequest } from "../autocomplete/types";
import { EditorAutocompleteController } from "./EditorAutocompleteController";

const position = {
  anchorTop: 10,
  anchorBottom: 20,
  top: 28,
  left: 16,
};

describe("EditorAutocompleteController", () => {
  it("builds a suggestion request from editor text and returns render state", async () => {
    const provider = new CapturingProvider([makeSuggestion("test-a", "привет")]);
    const controller = new EditorAutocompleteController(
      new AutocompleteService(provider),
    );
    const completion = await controller.updateCompletion("Это при", 7, position);

    expect(provider.requests[0]).toMatchObject({
      text: "Это при",
      cursorPosition: 7,
      prefix: "при",
      replacementRange: {
        from: 4,
        to: 7,
      },
      language: "ru",
      limit: 7,
    });
    expect(completion?.suggestions.map((suggestion) => suggestion.text)).toEqual([
      "привет",
    ]);
    expect(completion?.selectedIndex).toBe(0);
    expect(completion?.position).toEqual(position);
  });

  it("cycles the selected suggestion outside React components", async () => {
    const controller = new EditorAutocompleteController(
      new AutocompleteService(
        new CapturingProvider([
          makeSuggestion("test-a", "привет"),
          makeSuggestion("test-b", "приятно"),
        ]),
      ),
    );
    const completion = await controller.updateCompletion("при", 3, position);

    const result = controller.handleEditorCommand(completion ?? null, "selectPrevious");

    expect(result.handled).toBe(true);
    expect(result.completion?.selectedIndex).toBe(1);
  });

  it("returns the selected suggestion replacement range", async () => {
    const controller = new EditorAutocompleteController(
      new AutocompleteService(
        new CapturingProvider([
          makeSuggestion("test-a", "в связи с", {
            from: 0,
            to: 6,
          }),
        ]),
      ),
    );
    const completion = await controller.updateCompletion("в связ", 6, position);

    const result = controller.handleEditorCommand(completion ?? null, "acceptCompletion");

    expect(result.handled).toBe(true);
    expect(result.completion).toBeNull();
    expect(result.replacement).toEqual({
      from: 0,
      to: 6,
      text: "в связи с",
    });
  });

  it("uses suggestion insertText when completion should append only the missing suffix", async () => {
    const controller = new EditorAutocompleteController(
      new AutocompleteService(
        new CapturingProvider([
          {
            ...makeSuggestion("test-a", "в связи с", {
              from: 6,
              to: 6,
            }),
            insertText: "и с",
          },
        ]),
      ),
    );
    const completion = await controller.updateCompletion("в связ", 6, position);

    const result = controller.handleEditorCommand(completion ?? null, "acceptCompletion");

    expect(result.replacement).toEqual({
      from: 6,
      to: 6,
      text: "и с",
    });
  });

  it("closes completion when editor context has no Cyrillic prefix", async () => {
    const controller = new EditorAutocompleteController(
      new AutocompleteService(new CapturingProvider([])),
    );

    await expect(controller.updateCompletion("abc", 3, position)).resolves.toBeNull();
  });
});

function makeSuggestion(
  id: string,
  text: string,
  replacementRange?: Suggestion["replacementRange"],
): Suggestion {
  return {
    id,
    text,
    kind: "phrase",
    source: "test",
    replacementRange,
  };
}

class CapturingProvider implements SuggestionProvider {
  readonly name = "test";
  readonly requests: SuggestionRequest[] = [];

  constructor(private readonly suggestions: readonly Suggestion[]) {}

  async getSuggestions(request: SuggestionRequest): Promise<Suggestion[]> {
    this.requests.push(request);
    return [...this.suggestions];
  }
}
