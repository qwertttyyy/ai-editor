# Editor Codemap

## Что сейчас есть

Editor layer содержит CodeMirror editor и popup подсказок. Он отвечает за ввод, позицию popup, keyboard commands и отображение списка. Он не знает, как получены подсказки.

## Runtime flow

```text
TextEditor
  -> App callbacks
  -> EditorAutocompleteController
  -> SuggestionPopup render state
```

`TextEditor` сообщает наружу текст, позицию курсора и позицию popup. `App` передаёт это в controller и рендерит `SuggestionPopup`.

## Главные файлы

- `src/editor/TextEditor.tsx` — CodeMirror setup, keyboard mapping, replace range API.
- `src/editor/SuggestionPopup.tsx` — popup listbox, empty/error state, selected item.
- `src/styles.css` — визуальный стиль layout, editor, popup, status bar.
- `src/App.tsx` — связывает editor и popup.

## Что читать для задач

- Keyboard behavior: `TextEditor.tsx`, `EditorAutocompleteController.ts`.
- Popup positioning: `TextEditor.tsx`, `SuggestionPopup.tsx`.
- Popup rendering/empty state: `SuggestionPopup.tsx`.
- Visual style: `src/styles.css`, обязательно `docs/UI_DESIGN_GUIDE.md`.
- Accept insertion path: `TextEditor.replaceRange`, `EditorAutocompleteController.handleEditorCommand`.

## Инварианты

- React components не содержат provider-specific autocomplete logic.
- UI не вызывает Ollama, HTTP API, system commands или Tauri commands для autocomplete.
- `TextEditor` применяет переданный range/replacement, но не решает, какую подсказку выбрать.
- Изменения визуального стиля должны соответствовать `docs/UI_DESIGN_GUIDE.md`.

## Тесты

Сейчас основной coverage для editor autocomplete поведения находится в controller tests:

- `src/app/EditorAutocompleteController.test.ts`

Для визуальных/UI сценариев при необходимости добавлять component/e2e checks по `docs/TESTING_STRATEGY.md`.
