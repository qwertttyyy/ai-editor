import { useCallback, useMemo, useRef, useState } from "react";

import type { ActiveCompletion } from "./app/EditorAutocompleteController";
import { getAppStatusSnapshot } from "./app/appStatus";
import { createEditorAutocompleteController } from "./app/createEditorAutocompleteController";
import { SuggestionPopup } from "./editor/SuggestionPopup";
import {
  TextEditor,
  type EditorCommand,
  type TextEditorHandle,
} from "./editor/TextEditor";

type Theme = "light" | "dark";

const initialText =
  "Начните писать русский или English text. Например: привет, важная мысль, for example.";

export function App() {
  const editorRef = useRef<TextEditorHandle>(null);
  const [theme, setTheme] = useState<Theme>("light");
  const [text, setText] = useState(initialText);
  const [isEditorFocused, setIsEditorFocused] = useState(false);
  const [activeCompletion, setActiveCompletion] = useState<ActiveCompletion | null>(null);

  const autocompleteController = useMemo(() => createEditorAutocompleteController(), []);
  const appStatus = useMemo(() => getAppStatusSnapshot(), []);

  const updateCompletion = useCallback(
    async (
      nextText: string,
      cursorPosition: number,
      position: ActiveCompletion["position"],
    ) => {
      const completion = await autocompleteController.updateCompletion(
        nextText,
        cursorPosition,
        position,
      );

      if (completion === undefined) {
        return;
      }

      setActiveCompletion(completion);
    },
    [autocompleteController],
  );

  const handleEditorChange = useCallback(
    (
      nextText: string,
      cursorPosition: number,
      position: ActiveCompletion["position"],
    ) => {
      setText(nextText);
      void updateCompletion(nextText, cursorPosition, position);
    },
    [updateCompletion],
  );

  const acceptSelectedSuggestion = useCallback(() => {
    const result = autocompleteController.handleEditorCommand(
      activeCompletion,
      "acceptCompletion",
    );

    if (!result.handled || !result.replacement) {
      return false;
    }

    const nextState = editorRef.current?.replaceRange(
      result.replacement.from,
      result.replacement.to,
      result.replacement.text,
    );
    if (nextState) {
      setText(nextState.text);
    }

    setActiveCompletion(result.completion);
    return true;
  }, [activeCompletion, autocompleteController]);

  const handleEditorCommand = useCallback(
    (command: EditorCommand) => {
      if (command === "acceptCompletion") {
        return acceptSelectedSuggestion();
      }

      const result = autocompleteController.handleEditorCommand(
        activeCompletion,
        command,
      );

      if (!result.handled) {
        return false;
      }

      setActiveCompletion(result.completion);

      return true;
    },
    [acceptSelectedSuggestion, activeCompletion, autocompleteController],
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
          <span>Dictionary provider</span>
          <span>Runtime: {appStatus.runtimeLabel}</span>
          <span>Model: {appStatus.modelLabel}</span>
          <button
            className="theme-toggle"
            type="button"
            onClick={() =>
              setTheme((current) => (current === "light" ? "dark" : "light"))
            }
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
        <span>Provider: {activeCompletion?.provider ?? "Dictionary"}</span>
        <span>Autocomplete: {hasSuggestions ? "available" : autocompleteLabel}</span>
        <span>Language: {appStatus.languageLabel}</span>
        <span>{characterCount} chars</span>
        <span>{wordCount} words</span>
      </footer>
    </div>
  );
}
