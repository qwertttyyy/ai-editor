# Архитектура

Главный принцип: UI показывает состояние редактора и подсказки, но не знает, как именно подсказки получены.

## Границы слоёв

```text
App/UI -> Editor -> AutocompleteService -> SuggestionProvider -> InferenceAdapter
```

- `App/UI` — React-компоненты, layout, тема, пользовательские события.
- `Editor` — CodeMirror, состояние текста, popup подсказок.
- `AutocompleteService` — orchestration подсказок, ranking и fallback.
- `SuggestionProvider` — контракт источника подсказок.
- `InferenceAdapter` — низкоуровневый доступ к локальному inference backend.

Запрещённые зависимости:

```text
App/UI -> Ollama
App/UI -> HTTP API
App/UI -> system commands
Editor -> конкретная LLM
```

## Autocomplete

`AutocompleteService` принимает контекст редактора, вызывает активный `SuggestionProvider`, нормализует результат, ограничивает количество подсказок и применяет fallback.

`SuggestionProvider` возвращает подсказки в едином формате. Для MVP 1 достаточно `MockSuggestionProvider` и, при необходимости, простого `DictionarySuggestionProvider`. `OllamaSuggestionProvider` относится к MVP 2.

`RankingService` может быть простой функцией: убрать дубликаты, отфильтровать неподходящие подсказки и сохранить стабильный порядок.

## Inference и prompt

`InferenceAdapter` и `PromptBuilder` нужны только для LLM provider. Они не должны попадать в UI-компоненты.

`PromptBuilder` готовит prompt из ограниченного текстового контекста и не выполняет network calls. `InferenceAdapter` выполняет запросы к backend и преобразует ошибки в понятные состояния.

## Fallback

Fallback обязателен. В MVP 1 конечным fallback является `MockSuggestionProvider`; если другой provider ещё не подключён, сервис всё равно должен корректно обрабатывать error/empty.

Возможная схема MVP 1 при наличии dictionary provider:

```text
DictionarySuggestionProvider
  -> если error/empty
MockSuggestionProvider
```

Для MVP 2 схема может расшириться:

```text
OllamaSuggestionProvider
  -> DictionarySuggestionProvider
  -> MockSuggestionProvider
```

Ошибка provider не должна ломать ввод текста.

## Структура директорий

```text
src/
  app/
  editor/
    completion/
  autocomplete/
  inference/
  settings/
  models/
  shared/

src-tauri/
  src/
    commands/
```

`src/` содержит frontend и бизнес-логику. `src-tauri/` содержит минимальную нативную часть. Rust-код не должен разрастаться без необходимости.

Inference должен быть заменяемым: смена backend не должна требовать переписывания редактора и UI.
