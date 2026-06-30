import { useCallback, useMemo, useRef, useState } from "react";

import {
  AutocompleteService,
  type SuggestionResultStatus,
} from "./autocomplete/AutocompleteService";
import { MockSuggestionProvider } from "./autocomplete/MockSuggestionProvider";
import type { Suggestion, SuggestionRequest } from "./autocomplete/types";
import {
  getCyrillicPrefixRange,
  getNextSuggestionIndex,
} from "./autocomplete/textContext";
import {
  SuggestionPopup,
  type PopupPosition,
} from "./editor/SuggestionPopup";
import {
  TextEditor,
  type EditorCommand,
  type TextEditorHandle,
} from "./editor/TextEditor";

type Theme = "light" | "dark";

interface ActiveCompletion {
  request: SuggestionRequest;
  suggestions: Suggestion[];
  selectedIndex: number;
  status: SuggestionResultStatus;
  position: PopupPosition;
}

const initialText =
  "Начните писать русский текст. Например: привет, важная мысль, можно продолжить.";

export function App() {
  const editorRef = useRef<TextEditorHandle>(null);
  const requestVersionRef = useRef(0);
  const [theme, setTheme] = useState<Theme>("light");
  const [text, setText] = useState(initialText);
  const [isEditorFocused, setIsEditorFocused] = useState(false);
  const [activeCompletion, setActiveCompletion] = useState<ActiveCompletion | null>(
    null,
  );

  const autocompleteService = useMemo(
    () =>
      new AutocompleteService(new MockSuggestionProvider(), {
        limit: 7,
      }),
    [],
  );

  const closeCompletion = useCallback(() => {
    requestVersionRef.current += 1;
    setActiveCompletion(null);
  }, []);

  const updateCompletion = useCallback(
    async (nextText: string, cursorPosition: number, position: PopupPosition) => {
      const prefixRange = getCyrillicPrefixRange(nextText, cursorPosition);

      if (!prefixRange) {
        closeCompletion();
        return;
      }

      const version = requestVersionRef.current + 1;
      requestVersionRef.current = version;

      const request: SuggestionRequest = {
        text: nextText,
        cursorPosition,
        prefix: prefixRange.prefix,
        replacementRange: {
          from: prefixRange.from,
          to: prefixRange.to,
        },
        language: "ru",
        limit: 7,
      };

      const result = await autocompleteService.getSuggestions(request);

      if (requestVersionRef.current !== version) {
        return;
      }

      if (result.suggestions.length === 0) {
        setActiveCompletion({
          request,
          suggestions: [],
          selectedIndex: 0,
          status: result.status,
          position,
        });
        return;
      }

      setActiveCompletion({
        request,
        suggestions: result.suggestions,
        selectedIndex: 0,
        status: result.status,
        position,
      });
    },
    [autocompleteService, closeCompletion],
  );

  const handleEditorChange = useCallback(
    (nextText: string, cursorPosition: number, position: PopupPosition) => {
      setText(nextText);
      void updateCompletion(nextText, cursorPosition, position);
    },
    [updateCompletion],
  );

  const acceptSelectedSuggestion = useCallback(() => {
    if (!activeCompletion || activeCompletion.suggestions.length === 0) {
      return false;
    }

    const suggestion = activeCompletion.suggestions[activeCompletion.selectedIndex];
    if (!suggestion) {
      return false;
    }

    const nextState = editorRef.current?.replaceRange(
      activeCompletion.request.replacementRange.from,
      activeCompletion.request.replacementRange.to,
      suggestion.text,
    );

    if (nextState) {
      setText(nextState.text);
    }

    closeCompletion();
    return true;
  }, [activeCompletion, closeCompletion]);

  const handleEditorCommand = useCallback(
    (command: EditorCommand) => {
      if (!activeCompletion) {
        return false;
      }

      if (command === "closeCompletion") {
        closeCompletion();
        return true;
      }

      if (activeCompletion.suggestions.length === 0) {
        return false;
      }

      if (command === "acceptCompletion") {
        return acceptSelectedSuggestion();
      }

      setActiveCompletion((current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,
          selectedIndex: getNextSuggestionIndex(
            current.selectedIndex,
            current.suggestions.length,
            command === "selectNext" ? "next" : "previous",
          ),
        };
      });

      return true;
    },
    [acceptSelectedSuggestion, activeCompletion, closeCompletion],
  );

  const characterCount = text.length;
  const wordCount = text.trim() ? text.trim().split(/\s+/u).length : 0;
  const hasSuggestions =
    activeCompletion !== null && activeCompletion.suggestions.length > 0;
  const autocompleteLabel = activeCompletion
    ? activeCompletion.status
    : isEditorFocused
      ? "idle"
      : "ready";

  return (
    <div className="app" data-theme={theme}>
      <header className="top-bar">
        <div className="brand">
          <span className="brand-mark">ai</span>
          <span className="brand-title">ai-editor</span>
        </div>
        <div className="top-meta">
          <span>Mock provider</span>
          <button
            className="theme-toggle"
            type="button"
            onClick={() => setTheme((current) => (current === "light" ? "dark" : "light"))}
            aria-label="Переключить тему"
          >
            {theme === "light" ? "Dark" : "Light"}
          </button>
        </div>
      </header>

      <main className="editor-stage">
        <section className="editor-card" aria-label="Редактор текста">
          <TextEditor
            ref={editorRef}
            initialValue={initialText}
            onChange={handleEditorChange}
            onCommand={handleEditorCommand}
            onFocusChange={setIsEditorFocused}
          />
          {activeCompletion && (
            <SuggestionPopup
              suggestions={activeCompletion.suggestions}
              selectedIndex={activeCompletion.selectedIndex}
              status={activeCompletion.status}
              position={activeCompletion.position}
              visible={isEditorFocused && activeCompletion.status !== "idle"}
            />
          )}
        </section>
      </main>

      <footer className="status-bar">
        <span>Provider: Mock</span>
        <span>Autocomplete: {hasSuggestions ? "available" : autocompleteLabel}</span>
        <span>{characterCount} chars</span>
        <span>{wordCount} words</span>
        <span>RU</span>
      </footer>
    </div>
  );
}
