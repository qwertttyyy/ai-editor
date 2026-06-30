# ADR-0004: App-managed llama.cpp runtime

## Статус

Принято.

## Контекст

`ai-editor` должен работать как локальное desktop-приложение без обязательной установки Ollama пользователем. Dictionary autocomplete уже даёт быстрый offline-источник подсказок, но будущий LLM autocomplete требует управляемого локального runtime и моделей.

## Решение

Целевой runtime — bundled `llama.cpp` sidecar. Приложение будет управлять запуском runtime, хранением GGUF-моделей и выбором модели через отдельные слои:

- `ModelCatalog` описывает поддерживаемые модели без неподтверждённых URL и checksums;
- `ModelStorage` отвечает за будущие пути хранения и проверку файлов моделей;
- `ModelManager` связывает catalog, storage и статус модели;
- `RuntimeManager` отвечает за состояние runtime-процесса;
- `LlamaCppRuntimeAdapter` изолирует будущий запуск sidecar, health-check и completion/infill;
- `HardwareProfile` хранит CPU/GPU/VRAM/backend skeleton и безопасный CPU fallback для выбора профиля под CPU/GPU/RAM.

Dictionary autocomplete остаётся быстрым первым источником подсказок и не зависит от model/runtime слоёв. LLM autocomplete будет отдельным асинхронным источником через `SuggestionProvider` и inference adapter.

Ollama, если будет использоваться, остаётся optional/dev adapter и не является production runtime.

## Последствия

- Пользователь не обязан вручную устанавливать Ollama.
- Модели описываются как GGUF catalog entries; verified artifact metadata можно добавлять только после проверки источников, но автоматическое скачивание и запуск ещё не реализованы.
- Реальные model download URLs, имена файлов, размеры и checksums добавляются только после проверки источников.
- UI не запускает runtime, не знает model path и не обращается напрямую к HTTP/system APIs.
