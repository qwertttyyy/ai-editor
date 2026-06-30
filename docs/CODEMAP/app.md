# App Codemap

## Что сейчас есть

Приложение — React/Tauri shell для локального редактора русского текста. `App` отвечает за UI-состояние страницы: тему, текущий текст, focus editor-а и активное состояние completion popup.

Autocomplete orchestration вынесена из React-компонентов в `EditorAutocompleteController`.

## Runtime flow

```text
App
  -> EditorAutocompleteController
  -> AutocompleteService
  -> SuggestionProvider
```

`App` создаёт controller через `createAutocompleteService()` и передаёт editor events в controller. Controller возвращает render state или replacement command.

## Главные файлы

- `src/App.tsx` — composition UI, state, wiring editor/popup/controller.
- `src/app/createAutocompleteService.ts` — production wiring autocomplete service.
- `src/app/autocompleteConfig.ts` — code config для dictionary provider.
- `src/app/EditorAutocompleteController.ts` — request building, async versioning, command handling, replacement selection.

## Что читать для задач

- App wiring или provider config: `createAutocompleteService.ts`, `autocompleteConfig.ts`.
- Поведение accept/select/close completion: `EditorAutocompleteController.ts`.
- Отображение статуса provider-а или popup state: `App.tsx`.

## Инварианты

- `App` не создаёт concrete inference adapters и не вызывает HTTP/system APIs.
- `App` не строит prompt и не содержит provider-specific autocomplete logic.
- Controller может знать про autocomplete types, но не про React.
- Provider selection живёт в app wiring, а не внутри editor components.

## Тесты

- `src/app/EditorAutocompleteController.test.ts`
- `src/app/createAutocompleteService.test.ts`
