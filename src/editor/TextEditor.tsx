import {
  defaultKeymap,
  history,
  historyKeymap,
} from "@codemirror/commands";
import { EditorState } from "@codemirror/state";
import {
  drawSelection,
  dropCursor,
  EditorView,
  keymap,
} from "@codemirror/view";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";

import { applySuggestion } from "../autocomplete/textContext";
import type { PopupPosition } from "./SuggestionPopup";

export type EditorCommand =
  | "selectNext"
  | "selectPrevious"
  | "acceptCompletion"
  | "closeCompletion";

export interface TextEditorHandle {
  replaceRange(from: number, to: number, replacement: string): {
    text: string;
    cursorPosition: number;
  } | null;
}

interface TextEditorProps {
  initialValue: string;
  onChange: (
    text: string,
    cursorPosition: number,
    popupPosition: PopupPosition,
  ) => void;
  onCommand: (command: EditorCommand) => boolean;
  onFocusChange: (isFocused: boolean) => void;
}

export const TextEditor = forwardRef<TextEditorHandle, TextEditorProps>(
  function TextEditor(
    { initialValue, onChange, onCommand, onFocusChange },
    ref,
  ) {
    const hostRef = useRef<HTMLDivElement | null>(null);
    const viewRef = useRef<EditorView | null>(null);
    const callbacksRef = useRef({ onChange, onCommand, onFocusChange });

    useEffect(() => {
      callbacksRef.current = { onChange, onCommand, onFocusChange };
    }, [onChange, onCommand, onFocusChange]);

    useImperativeHandle(ref, () => ({
      replaceRange(from, to, replacement) {
        const view = viewRef.current;

        if (!view) {
          return null;
        }

        const currentText = view.state.doc.toString();
        const nextState = applySuggestion(currentText, { from, to }, replacement);

        view.dispatch({
          changes: { from, to, insert: replacement },
          selection: { anchor: nextState.cursorPosition },
          scrollIntoView: true,
        });

        return nextState;
      },
    }));

    useEffect(() => {
      if (!hostRef.current) {
        return;
      }

      const autocompleteKeymap = keymap.of([
        {
          key: "ArrowDown",
          run: () => callbacksRef.current.onCommand("selectNext"),
        },
        {
          key: "ArrowUp",
          run: () => callbacksRef.current.onCommand("selectPrevious"),
        },
        {
          key: "Tab",
          run: () => callbacksRef.current.onCommand("acceptCompletion"),
        },
        {
          key: "Escape",
          run: () => callbacksRef.current.onCommand("closeCompletion"),
        },
      ]);

      const view = new EditorView({
        parent: hostRef.current,
        state: EditorState.create({
          doc: initialValue,
          extensions: [
            history(),
            drawSelection(),
            dropCursor(),
            EditorView.lineWrapping,
            autocompleteKeymap,
            keymap.of([...defaultKeymap, ...historyKeymap]),
            EditorView.updateListener.of((update) => {
              if (!update.docChanged && !update.selectionSet) {
                return;
              }

              const cursorPosition = update.state.selection.main.head;
              const popupPosition = getPopupPosition(update.view, cursorPosition);

              callbacksRef.current.onChange(
                update.state.doc.toString(),
                cursorPosition,
                popupPosition,
              );
            }),
            EditorView.focusChangeEffect.of((_state, focusing) => {
              callbacksRef.current.onFocusChange(focusing);
              return null;
            }),
            EditorView.theme({
              ".cm-gutters": {
                display: "none",
              },
              ".cm-scroller": {
                fontFamily: "inherit",
              },
              ".cm-content": {
                fontFamily: "inherit",
              },
            }),
          ],
        }),
      });

      viewRef.current = view;

      return () => {
        view.destroy();
        viewRef.current = null;
      };
    }, [initialValue]);

    return <div ref={hostRef} className="editor-shell" />;
  },
);

function getPopupPosition(view: EditorView, cursorPosition: number): PopupPosition {
  const cursorRect = view.coordsAtPos(cursorPosition);
  const viewportPadding = 16;
  const popupGap = 8;
  const popupWidth = 320;

  if (!cursorRect) {
    return {
      anchorTop: viewportPadding,
      anchorBottom: viewportPadding,
      top: viewportPadding,
      left: viewportPadding,
    };
  }

  return {
    anchorTop: cursorRect.top,
    anchorBottom: cursorRect.bottom,
    top: cursorRect.bottom + popupGap,
    left: Math.max(
      viewportPadding,
      Math.min(cursorRect.left, window.innerWidth - popupWidth - viewportPadding),
    ),
  };
}
