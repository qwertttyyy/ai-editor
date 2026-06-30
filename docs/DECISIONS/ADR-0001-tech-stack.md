# ADR-0001: Технологический стек

## Статус

Принято.

## Контекст

Нужен лёгкий desktop-редактор с React UI, качественной текстовой областью и тестируемой TypeScript-логикой. Локальный inference должен подключаться позже без переписывания UI.

## Решение

Использовать Tauri 2, React, TypeScript, CodeMirror 6, Vitest, ESLint, Prettier и npm. Локальный inference backend подключать только через adapter/provider, когда это входит в task scope.

Дополнение: целевой production runtime описан в ADR-0004 как bundled llama.cpp sidecar. Ollama не является обязательной зависимостью пользователя.

## Последствия

- Rust-часть остаётся минимальной.
- CodeMirror нужно визуально адаптировать под текстовый редактор, а не IDE.
- UI не обращается к local inference backend напрямую.
- Unit-тесты чистой логики не требуют локального inference backend.
- Inference остаётся заменяемым.
