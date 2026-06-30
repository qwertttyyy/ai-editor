# Models And Runtime Codemap

## Что сейчас есть

Проект ориентирован на app-managed local inference через bundled `llama.cpp`, но реальный sidecar binary и скачивание моделей ещё не реализованы.

Сейчас есть typed skeleton:

- catalog выбранных моделей;
- model manager для default model и статусов;
- model storage для будущих путей GGUF-файлов;
- runtime manager для состояния процесса;
- llama.cpp runtime adapter, который возвращает `not-ready` и не запускает бинарник.

## Главные файлы

- `src/models/modelTypes.ts` — типы model catalog и статусов.
- `src/models/modelCatalog.ts` — catalog-only список Qwen3/Ruadapt моделей без URL/checksums.
- `src/models/modelSelection.ts` — выбор default model и фильтрация по языку.
- `src/models/ModelManager.ts` — список моделей, default model, текущий status.
- `src/models/ModelStorage.ts` — будущие пути хранения моделей без реального filesystem access.
- `src/runtime/runtimeTypes.ts` — типы runtime readiness, binary status, start request.
- `src/runtime/RuntimeProcessState.ts` — состояние `stopped / starting / running / failed`.
- `src/runtime/RuntimeManager.ts` — orchestration runtime state.
- `src/runtime/LlamaCppRuntimeAdapter.ts` — будущий adapter bundled llama.cpp sidecar.

## Что читать для задач

- Изменить catalog моделей: `modelTypes.ts`, `modelCatalog.ts`, `modelCatalog.test.ts`.
- Добавить установку/проверку моделей: `ModelStorage.ts`, `ModelManager.ts`, docs/ADR.
- Добавить запуск sidecar: `RuntimeManager.ts`, `LlamaCppRuntimeAdapter.ts`, `src-tauri/`.
- Показать runtime/model статус: app facade/status files, не React -> runtime напрямую.

## Инварианты

- Не выдумывать GGUF URL, filenames, sizeBytes и sha256.
- UI не запускает runtime и не знает model filesystem paths.
- Dictionary autocomplete не зависит от `models/` и `runtime/`.
- Unit-тесты не требуют реальных model files, сети, Ollama или llama.cpp binary.
- Ollama может существовать только как optional/dev adapter, не production path.

## Тесты

- `src/models/modelCatalog.test.ts`
- `src/runtime/RuntimeManager.test.ts`
