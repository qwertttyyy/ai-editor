# ADR-0005: Safe model install/runtime vertical slice

## Статус

Принято.

## Контекст

Проект переходит к app-managed local inference, но пока не должен скачивать модели, запускать LLM autocomplete или требовать установленный Ollama. Нужен безопасный вертикальный срез: проверенная metadata модели, реальный app-data storage path, стратегия sidecar packaging, health-check и hardware skeleton.

## Решение

- Первой моделью с verified artifact metadata выбрана `Qwen3-0.6B-Q8_0.gguf` из `Qwen/Qwen3-0.6B-GGUF`.
- Metadata содержит source page, download URL, filename, size и SHA-256 из официального Hugging Face/LFS источника.
- Остальные модели остаются `catalog-only`, пока для них не проверены artifacts.
- `ModelStorage` строит пути только внутри app-data `models` directory и не принимает произвольные path от UI.
- Tauri/native layer отдаёт реальный app-data path через command, но UI не знает model filesystem paths напрямую.
- `llama.cpp` sidecar packaging пока зафиксирован как стратегия: директория `src-tauri/binaries/`, без добавления fake binary и без `bundle.externalBin` на несуществующий файл.
- `bundle.externalBin` включается только в той задаче, где добавляется или подготавливается проверенный platform-specific sidecar binary.
- Runtime health-check ограничен локальным `127.0.0.1` `/health` на контролируемом порту и не делает completion/infill.
- `HardwareProfile` добавлен как skeleton: CPU/GPU/VRAM/backend types, platform adapter boundary и safe CPU fallback.

## Последствия

- `Qwen3-0.6B` может считаться `downloadable` по catalog metadata, но реальное скачивание ещё не реализовано.
- Приложение не обещает пользователю установленную модель или запущенный runtime.
- Следующий этап может добавить скачивание с checksum verification и затем реальный sidecar spawn.
- Dictionary autocomplete остаётся независимым и продолжает работать без сети и без runtime.
