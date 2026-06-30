# Testing Codemap

## Что сейчас есть

Проект использует Vitest для unit tests, ESLint для lint, TypeScript typecheck и Vite web build в общей проверке.

## Команды

```bash
npm run typecheck
npm run lint
npm run test
npm run build:web
npm run format:check
npm run check
```

`npm run check` запускает `typecheck`, `lint`, `test`, `build:web`.

## Главные тесты

- `src/autocomplete/AutocompleteService.test.ts` — service ranking, dedupe, fallback policy.
- `src/autocomplete/dictionary/DictionarySuggestionProvider.test.ts` — dictionary prefix matching, phrases, dedupe, exact prefix, n-gram config.
- `src/app/createAutocompleteService.test.ts` — production wiring и code config.
- `src/app/EditorAutocompleteController.test.ts` — request building, selection, replacement, insertText.

## Что читать для задач

- Autocomplete behavior: сначала `docs/CODEMAP/autocomplete.md`, затем соответствующий test file.
- UI/editor behavior: `docs/CODEMAP/editor.md`, затем controller tests и при необходимости component/e2e.
- App wiring/config: `docs/CODEMAP/app.md`, затем `createAutocompleteService.test.ts`.

## Инварианты

- Чистая логика должна иметь unit tests.
- Unit tests не требуют Ollama, сети или локальной LLM.
- Fallback на ошибку и empty behavior тестируются отдельно.
- Если добавлена команда форматирования или меняются форматируемые файлы, запускать `npm run format:check`.
- После feature-задачи запускать доступные проверки и явно писать, что не запускалось и почему.

## Ограничения

Playwright использовать только для UI/e2e, скриншотов и проверки поведения интерфейса. Для чистой autocomplete logic достаточно unit/controller tests.
