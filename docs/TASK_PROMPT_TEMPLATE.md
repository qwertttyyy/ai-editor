# Шаблон задачи

```md
# Задача

## Цель

## Контекст

## Что нужно сделать

## Что нельзя менять

## Архитектурные ограничения

## Acceptance criteria

## Проверки

## Нужны ли subagents
```

## Пример: mock autocomplete

```md
# Задача

## Цель

Реализовать mock autocomplete для MVP 1.

## Контекст

Проект использует архитектуру `AutocompleteService` -> `SuggestionProvider`.
В MVP 1 подсказки должны работать без Ollama.

## Что нужно сделать

- Создать типы подсказок.
- Создать `SuggestionProvider` interface.
- Создать `MockSuggestionProvider`.
- Создать `AutocompleteService`.
- Подключить mock autocomplete к editor UI.
- Добавить unit-тесты для выбора и вставки подсказки.

## Что нельзя менять

- Не добавлять Ollama integration.
- Не менять визуальный стиль без обновления `docs/UI_DESIGN_GUIDE.md`.
- Не добавлять новые зависимости без необходимости.

## Архитектурные ограничения

UI не должен знать о конкретном provider.
Сервис не должен зависеть от React.

## Acceptance criteria

- При вводе текста появляются 3-7 mock-подсказок.
- Стрелки вверх/вниз выбирают подсказку.
- `Tab` вставляет выбранную подсказку.
- `Esc` закрывает popup.
- Unit-тесты проходят.

## Проверки

- `npm run typecheck`
- `npm run lint`
- `npm run test`

## Нужны ли subagents

Да: reviewer и tester после реализации.
```

## Пример: Ollama health-check

```md
# Задача

## Цель

Добавить health-check для локального Ollama endpoint без подключения полноценного LLM autocomplete.

## Контекст

Ollama должен быть изолирован за inference adapter. UI не должен напрямую обращаться к HTTP endpoint.

## Что нужно сделать

- Создать `OllamaInferenceAdapter`.
- Добавить метод health-check.
- Вернуть состояния `ready`, `offline`, `error`.
- Показать статус в верхней или нижней панели.
- Добавить тесты с mock HTTP layer.

## Что нельзя менять

- Не реализовывать `OllamaSuggestionProvider`.
- Не добавлять скачивание моделей.
- Не добавлять настройки выбора модели.

## Архитектурные ограничения

UI вызывает только сервис состояния или adapter facade.
HTTP-вызовы не должны находиться в React-компонентах.

## Acceptance criteria

- При доступном Ollama статус показывает `ready`.
- При недоступном endpoint статус показывает `offline`.
- Ошибка не ломает редактор.
- Unit-тесты не требуют установленной Ollama.

## Проверки

- `npm run typecheck`
- `npm run lint`
- `npm run test`

## Нужны ли subagents

Да: reviewer для проверки границы UI/inference.
```
