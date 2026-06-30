# ADR-0002: Архитектура autocomplete

## Статус

Принято.

## Контекст

Источники подсказок будут меняться: mock, dictionary, Ollama и возможные будущие backend. UI не должен зависеть от конкретного источника.

## Решение

```text
Editor UI -> AutocompleteService -> SuggestionProvider -> provider implementation
```

`AutocompleteService` управляет вызовом provider, ranking и fallback. `SuggestionProvider` задаёт общий контракт источника подсказок. LLM — только один из provider, не центр архитектуры.

Fallback обязателен: ошибка или пустой ответ provider не должны ломать ввод текста.

## Последствия

- UI не знает о модели, endpoint и inference backend.
- Prompt-building и HTTP-вызовы не попадают в React-компоненты.
- `MockSuggestionProvider` нужен для локальной разработки и fallback-сценариев.
- Fallback-логика тестируется отдельно.
