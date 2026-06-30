# ADR-0001: Технологический стек

## Статус

Принято.

## Контекст

Нужен лёгкий desktop-редактор с React UI, качественной текстовой областью и тестируемой TypeScript-логикой. Локальный inference должен подключаться позже без переписывания UI.

## Решение

Использовать Tauri 2, React, TypeScript, CodeMirror 6, Vitest, ESLint, Prettier и npm. Ollama и другие inference backend подключать только через adapter/provider, когда это входит в task scope.

## Последствия

- Rust-часть остаётся минимальной.
- CodeMirror нужно визуально адаптировать под текстовый редактор, а не IDE.
- UI не обращается к Ollama напрямую.
- Unit-тесты чистой логики не требуют Ollama.
- Inference остаётся заменяемым.
