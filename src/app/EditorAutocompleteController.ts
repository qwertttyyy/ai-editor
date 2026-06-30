import {
  AutocompleteService,
  type SuggestionResultStatus,
} from "../autocomplete/AutocompleteService";
import {
  getCyrillicPrefixRange,
  getNextSuggestionIndex,
} from "../autocomplete/textContext";
import type { Suggestion, SuggestionRequest } from "../autocomplete/types";

export interface CompletionPopupPosition {
  anchorTop: number;
  anchorBottom: number;
  top: number;
  left: number;
}

export interface ActiveCompletion {
  request: SuggestionRequest;
  suggestions: Suggestion[];
  selectedIndex: number;
  status: SuggestionResultStatus;
  provider: string;
  position: CompletionPopupPosition;
}

export type AutocompleteEditorCommand =
  "selectNext" | "selectPrevious" | "acceptCompletion" | "closeCompletion";

export interface SuggestionReplacement {
  from: number;
  to: number;
  text: string;
}

export interface AutocompleteCommandResult {
  handled: boolean;
  completion: ActiveCompletion | null;
  replacement?: SuggestionReplacement;
}

interface EditorAutocompleteControllerOptions {
  limit?: number;
}

export class EditorAutocompleteController {
  private readonly service: AutocompleteService;
  private readonly limit: number;
  private requestVersion = 0;

  constructor(
    service: AutocompleteService,
    options: EditorAutocompleteControllerOptions = {},
  ) {
    this.service = service;
    this.limit = options.limit ?? 7;
  }

  async updateCompletion(
    text: string,
    cursorPosition: number,
    position: CompletionPopupPosition,
  ): Promise<ActiveCompletion | null | undefined> {
    const prefixRange = getCyrillicPrefixRange(text, cursorPosition);

    if (!prefixRange) {
      return this.closeCompletion();
    }

    const version = this.nextRequestVersion();
    const request: SuggestionRequest = {
      text,
      cursorPosition,
      prefix: prefixRange.prefix,
      replacementRange: {
        from: prefixRange.from,
        to: prefixRange.to,
      },
      language: "ru",
      limit: this.limit,
    };
    const result = await this.service.getSuggestions(request);

    if (this.requestVersion !== version) {
      return undefined;
    }

    return {
      request,
      suggestions: result.suggestions,
      selectedIndex: 0,
      status: result.status,
      provider: result.provider,
      position,
    };
  }

  closeCompletion(): null {
    this.nextRequestVersion();
    return null;
  }

  handleEditorCommand(
    completion: ActiveCompletion | null,
    command: AutocompleteEditorCommand,
  ): AutocompleteCommandResult {
    if (!completion) {
      return {
        handled: false,
        completion,
      };
    }

    if (command === "closeCompletion") {
      return {
        handled: true,
        completion: this.closeCompletion(),
      };
    }

    if (completion.suggestions.length === 0) {
      return {
        handled: false,
        completion,
      };
    }

    if (command === "acceptCompletion") {
      const replacement = this.getSelectedReplacement(completion);

      if (!replacement) {
        return {
          handled: false,
          completion,
        };
      }

      return {
        handled: true,
        completion: this.closeCompletion(),
        replacement,
      };
    }

    return {
      handled: true,
      completion: {
        ...completion,
        selectedIndex: getNextSuggestionIndex(
          completion.selectedIndex,
          completion.suggestions.length,
          command === "selectNext" ? "next" : "previous",
        ),
      },
    };
  }

  private getSelectedReplacement(
    completion: ActiveCompletion,
  ): SuggestionReplacement | null {
    const suggestion = completion.suggestions[completion.selectedIndex];

    if (!suggestion) {
      return null;
    }

    return {
      from: suggestion.replacementRange?.from ?? completion.request.replacementRange.from,
      to: suggestion.replacementRange?.to ?? completion.request.replacementRange.to,
      text: suggestion.insertText ?? suggestion.text,
    };
  }

  private nextRequestVersion(): number {
    this.requestVersion += 1;
    return this.requestVersion;
  }
}
