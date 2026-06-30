# Архитектура

Главный принцип: UI показывает состояние редактора и подсказки, но не знает, как именно подсказки получены.

## Слои

```text
UI layer
  -> application/services layer
  -> autocomplete layer
  -> provider layer
  -> inference adapter layer
  -> Tauri/native layer
```

- `UI layer` — React-компоненты, CodeMirror, layout, тема, popup, пользовательские события.
- `application/services layer` — orchestration пользовательских сценариев, состояние приложения, связь UI с доменной логикой.
- `autocomplete layer` — `AutocompleteService`, ranking, dedupe, limit, fallback.
- `provider layer` — `SuggestionProvider` и конкретные providers: mock, dictionary, history, LLM-based provider.
- `inference adapter layer` — adapters для локального inference backend, преобразование запросов и ошибок.
- `Tauri/native layer` — минимальные native commands и доступ к возможностям ОС, если они нужны задаче.
- `storage/settings layer` — будущие настройки, пользовательские словари, история и persisted state.

## Правила зависимостей

Разрешённая цепочка autocomplete:

```text
Editor UI -> AutocompleteService -> SuggestionProvider -> provider implementation
```

Запрещённые зависимости:

```text
App/UI -> Ollama
App/UI -> HTTP API
App/UI -> system commands
Editor -> конкретная LLM
React component -> prompt-building
React component -> inference adapter
```

UI может вызывать только сервисы или adapter facade, если это явно предусмотрено задачей. Inference и HTTP-вызовы не должны находиться в React-компонентах.

## Autocomplete

`AutocompleteService` принимает контекст редактора, вызывает активный `SuggestionProvider`, нормализует результат, ограничивает количество подсказок и применяет fallback.

`SuggestionProvider` возвращает подсказки в едином формате. Конкретный источник подсказок скрыт за provider contract.

Ranking может быть простой функцией: убрать дубликаты, отфильтровать неподходящие подсказки и сохранить стабильный порядок.

## Inference и prompt

`InferenceAdapter` и prompt-building относятся к inference/provider слоям. Они не должны попадать в UI-компоненты.

Prompt builder готовит prompt из ограниченного текстового контекста и не выполняет network calls. `InferenceAdapter` выполняет запросы к backend и преобразует ошибки в понятные состояния.

## Fallback

Fallback обязателен для autocomplete-задач. Ошибка provider не должна ломать ввод текста.

Возможная схема:

```text
PrimarySuggestionProvider
  -> если error/empty
FallbackSuggestionProvider
```

## Структура директорий

```text
src/
  app/
  editor/
  autocomplete/
  inference/
  settings/
  shared/

src-tauri/
  src/
```

`src/` содержит frontend и бизнес-логику. `src-tauri/` содержит минимальную нативную часть. Rust-код не должен разрастаться без необходимости.

Inference должен быть заменяемым: смена backend не должна требовать переписывания редактора и UI.
