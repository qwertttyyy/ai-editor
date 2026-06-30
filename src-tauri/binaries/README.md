# llama.cpp sidecar binaries

Эта директория зарезервирована для будущих bundled `llama-server` sidecar binaries.

Правила:

- не добавлять бинарники без проверенного источника сборки;
- не включать `bundle.externalBin` в `tauri.conf.json`, пока бинарник реально не добавлен;
- имена platform-specific binaries должны соответствовать требованиям Tauri sidecar packaging;
- sidecar запускается только через native/runtime слой, не из React-компонентов.

Текущий этап добавляет только storage/status/health-check skeleton. Реальный binary packaging будет отдельной задачей.
