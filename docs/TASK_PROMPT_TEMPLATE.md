# Шаблон промта задачи

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

## Нужен ли MCP
```

## Пример: dictionary autocomplete

```md
# Задача

## Цель

Добавить или изменить dictionary autocomplete в рамках текущей задачи.

## Контекст

Проект использует архитектуру `AutocompleteService` -> `SuggestionProvider`. Dictionary-подсказки должны работать без установленной Ollama, bundled runtime и сети.

## Что нужно сделать

- Обновить типы подсказок.
- Обновить `SuggestionProvider` contract при необходимости.
- Обновить dictionary provider или словарные данные.
- Обновить `AutocompleteService`.
- Подключить поведение к editor UI, если это входит в scope.
- Добавить unit-тесты для выбора и вставки подсказки.

## Что нельзя менять

- Не добавлять реальную LLM/runtime integration, если она не входит в задачу.
- Не менять визуальный стиль без обновления `docs/UI_DESIGN_GUIDE.md`.
- Не добавлять новые зависимости без причины.

## Архитектурные ограничения

UI не должен знать о конкретном provider. Сервис не должен зависеть от React.

## Acceptance criteria

- При вводе текста появляются dictionary-подсказки.
- Стрелки вверх/вниз выбирают подсказку.
- `Tab` вставляет выбранную подсказку.
- `Esc` закрывает popup.
- Unit-тесты проходят.

## Проверки

- `npm run typecheck`
- `npm run lint`
- `npm run test`

## Нужны ли subagents

Да: reviewer и tester, если изменение крупное или затрагивает UI.

## Нужен ли MCP

Нет, если хватает локального кода и docs.
```

## Пример: llama.cpp runtime status

```md
# Задача

## Цель

Добавить status/health-check facade для будущего bundled llama.cpp runtime без подключения полноценного LLM autocomplete.

## Контекст

llama.cpp runtime должен быть изолирован за runtime/inference adapter. UI не должен напрямую запускать процесс, читать model path или обращаться к HTTP endpoint.

## Что нужно сделать

- Создать или обновить `RuntimeManager` / `LlamaCppRuntimeAdapter`.
- Добавить метод health-check.
- Вернуть состояния `ready`, `offline`, `error`.
- Показать статус через service/facade, если это входит в scope.
- Добавить тесты с тестовым HTTP adapter.

## Что нельзя менять

- Не добавлять скачивание моделей.
- Не добавлять настройки выбора модели, если они не входят в задачу.

## Архитектурные ограничения

UI вызывает только сервис состояния или application facade. Process management и HTTP-вызовы не должны находиться в React-компонентах.

## Acceptance criteria

- При доступном runtime статус показывает `ready`.
- При недоступном endpoint статус показывает `offline`.
- Ошибка не ломает редактор.
- Unit-тесты не требуют установленного llama.cpp или модели.

## Проверки

- `npm run typecheck`
- `npm run lint`
- `npm run test`

## Нужны ли subagents

Да: architect перед реализацией и reviewer для проверки границы UI/inference, если изменение крупное.

## Нужен ли MCP

Context7 нужен только если требуется актуальная документация внешней библиотеки или API.
```
