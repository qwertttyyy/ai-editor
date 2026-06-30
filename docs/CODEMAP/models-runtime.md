# Models And Runtime Codemap

## Что сейчас есть

Проект ориентирован на app-managed local inference через bundled `llama.cpp`, но реальный sidecar binary, скачивание моделей и LLM autocomplete ещё не реализованы.

Сейчас есть safe vertical slice:

- catalog выбранных моделей;
- verified GGUF artifact metadata для `Qwen3-0.6B-Q8_0.gguf`;
- model manager для default model и статусов;
- model storage для безопасных app-data путей GGUF-файлов;
- Tauri command для реального app-data model storage path;
- runtime manager для состояния процесса и health-check;
- llama.cpp runtime adapter/host, который не делает completion;
- hardware profile skeleton с CPU/GPU/VRAM/backend типами и CPU fallback.

## Главные файлы

- `src/models/modelTypes.ts` — типы model catalog и статусов.
- `src/models/modelCatalog.ts` — список Qwen3/Ruadapt моделей; только `Qwen3-0.6B` имеет verified artifact metadata.
- `src/models/modelSelection.ts` — выбор default model и фильтрация по языку.
- `src/models/ModelManager.ts` — список моделей, default model, текущий status.
- `src/models/ModelStorage.ts` — безопасное построение app-data model paths и status snapshot без реального filesystem scan.
- `src/models/ModelStorageBridge.ts` — typed bridge для Tauri storage info provider.
- `src/hardware/hardwareTypes.ts` — типы CPU/GPU/VRAM/backend.
- `src/hardware/HardwareProfile.ts` — safe CPU fallback и adapter boundary.
- `src/hardware/modelHardwareRecommendation.ts` — связь `HardwareProfile` с `ModelCatalog.recommendedHardware`.
- `src/runtime/runtimeTypes.ts` — типы runtime readiness, binary status, start request.
- `src/runtime/RuntimeProcessState.ts` — состояние `stopped / starting / running / failed`.
- `src/runtime/RuntimeManager.ts` — orchestration runtime state.
- `src/runtime/RuntimeHost.ts` — planned/Tauri host boundary для sidecar status и health-check.
- `src/runtime/LlamaCppRuntimeAdapter.ts` — adapter bundled llama.cpp sidecar без completion.
- `src-tauri/src/model_storage.rs` — app-data model storage command.
- `src-tauri/src/runtime.rs` — localhost `/health` runtime check без completion.
- `src-tauri/src/hardware.rs` — safe CPU hardware fallback command.
- `src-tauri/binaries/README.md` — стратегия будущего sidecar packaging.

## Что читать для задач

- Изменить catalog моделей: `modelTypes.ts`, `modelCatalog.ts`, `modelCatalog.test.ts`.
- Добавить установку/проверку моделей: `ModelStorage.ts`, `ModelStorageBridge.ts`, `ModelManager.ts`, `src-tauri/src/model_storage.rs`, docs/ADR.
- Добавить запуск sidecar: `RuntimeManager.ts`, `LlamaCppRuntimeAdapter.ts`, `src-tauri/`.
- Добавить hardware detection: `src/hardware/*`, `src-tauri/src/hardware.rs`, model recommendation tests.
- Показать runtime/model статус: app facade/status files, не React -> runtime напрямую.

## Инварианты

- Не выдумывать GGUF URL, filenames, sizeBytes и sha256; artifact metadata добавлять только после проверки источника.
- UI не запускает runtime и не знает model filesystem paths.
- Dictionary autocomplete не зависит от `models/` и `runtime/`.
- Unit-тесты не требуют реальных model files, сети, Ollama или llama.cpp binary.
- Health-check использует только local `127.0.0.1` и не отправляет пользовательский текст.
- Safe hardware fallback — CPU.
- Ollama может существовать только как optional/dev adapter, не production path.

## Тесты

- `src/models/modelCatalog.test.ts`
- `src/runtime/RuntimeManager.test.ts`
- `src/hardware/modelHardwareRecommendation.test.ts`
- `cargo test` в `src-tauri/` для native helpers.
