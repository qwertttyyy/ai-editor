# Архитектура

Главный принцип: UI показывает состояние редактора, подсказки и краткий runtime/model статус, но не знает, как именно подсказки получены и как запускается локальный inference.

## Слои

```text
UI layer
  -> application/services layer
  -> autocomplete layer
  -> provider layer
  -> inference adapter layer
  -> model/runtime management layer
  -> Tauri/native layer
```

- `UI layer` — React-компоненты, CodeMirror, layout, тема, popup, пользовательские события.
- `application/services layer` — orchestration пользовательских сценариев, состояние приложения, связь UI с доменной логикой.
- `autocomplete layer` — `AutocompleteService`, ranking, dedupe, limit, fallback.
- `provider layer` — `SuggestionProvider` и конкретные providers: dictionary, history, LLM-based provider.
- `inference adapter layer` — adapters для локального inference backend, преобразование запросов и ошибок.
- `model/runtime management layer` — catalog моделей, storage, model manager, runtime manager и adapter bundled llama.cpp.
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
App/UI -> llama.cpp process
App/UI -> model filesystem paths
App/UI -> HTTP API
App/UI -> system commands
Editor -> конкретная LLM
React component -> prompt-building
React component -> inference adapter
```

UI может вызывать только сервисы или adapter facade, если это явно предусмотрено задачей. Inference и HTTP-вызовы не должны находиться в React-компонентах.

## Autocomplete

`AutocompleteService` принимает контекст редактора, вызывает активный `SuggestionProvider`, нормализует результат, ограничивает количество подсказок и применяет fallback policy.

`SuggestionProvider` возвращает подсказки в едином формате. Конкретный источник подсказок скрыт за provider contract.

`DictionarySuggestionProvider` — быстрый локальный provider для русских и английских слов и фразовых prefix-completion. Он работает на небольшом встроенном curated dictionary, не обращается к сети и не зависит от model/runtime слоёв. Контекстные n-граммные triggers выключены по умолчанию через code config, чтобы словарь не конкурировал с будущими LLM-продолжениями.

`SuggestionRequest.language` использует `ru` или `en`. Режим `auto` определяется в application/controller слое по текущему prefix: кириллица даёт `ru`, латиница даёт `en`, смешанные токены не предлагаются.

Ranking может быть простой функцией: убрать дубликаты, отфильтровать неподходящие подсказки и сохранить стабильный порядок.

## Inference и prompt

`InferenceAdapter` и prompt-building относятся к inference/provider слоям. Они не должны попадать в UI-компоненты.

Prompt builder готовит prompt из ограниченного текстового контекста и не выполняет network calls. `InferenceAdapter` выполняет запросы к backend и преобразует ошибки в понятные состояния.

Целевой production runtime — bundled `llama.cpp` sidecar. Ollama-заготовки, если остаются в коде, считаются optional/dev adapter-ами и не являются обязательной зависимостью пользователя.

LLM autocomplete должен подключаться отдельным асинхронным `SuggestionProvider`, а не смешиваться с dictionary provider. Ошибки или задержки LLM не должны блокировать ввод и быстрые dictionary-подсказки.

## Models и runtime

`ModelCatalog` хранит catalog-only описания выбранных моделей: Qwen3 и Ruadapt Qwen2.5 профили для `ru/en`. Пока не добавлены проверенные GGUF artifacts, URL и checksums не указываются.

`ModelManager` отвечает за список моделей, default model и будущий статус `catalog-only / downloading / installed / failed`.

`ModelStorage` отвечает за будущие пути хранения GGUF-файлов и проверку наличия модели. Unit-тесты не должны требовать реальных model files.

`RuntimeManager` отвечает за выбранный runtime и состояние процесса `stopped / starting / running / failed`.

`LlamaCppRuntimeAdapter` отвечает за будущий запуск bundled `llama-server` sidecar, health-check локального runtime и completion/infill. На текущем этапе adapter не запускает бинарник и возвращает `not-ready`, потому что sidecar ещё не упакован.

## Fallback

Fallback обязателен для autocomplete-задач. Ошибка provider не должна ломать ввод текста. Пустой результат provider может оставаться пустым результатом, чтобы не показывать нерелевантные подсказки.

Возможная схема:

```text
PrimarySuggestionProvider
  -> если error или явно разрешённый empty fallback
FallbackSuggestionProvider
```

## Структура директорий

```text
src/
  app/
  editor/
  autocomplete/
  inference/
  models/
  runtime/
  settings/
  shared/

src-tauri/
  src/
```

`src/` содержит frontend и бизнес-логику. `src-tauri/` содержит минимальную нативную часть. Rust-код не должен разрастаться без необходимости.

Inference должен быть заменяемым: смена backend не должна требовать переписывания редактора и UI.
