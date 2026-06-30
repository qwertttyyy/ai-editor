# Roadmap

Roadmap задаёт направление, но не расширяет scope текущей задачи.

## MVP 1

Минимальный локальный редактор с mock autocomplete. Детальный scope зафиксирован в `docs/MVP_1_SCOPE.md`.

## MVP 2

Реальные локальные источники подсказок и базовые настройки:

- Ollama health-check;
- `OllamaSuggestionProvider`;
- выбор модели и endpoint;
- dictionary/history provider;
- улучшенный ranking;
- простое открытие и сохранение `.txt`.

## Возможный MVP 3

Расширение локального inference и пользовательских возможностей:

- model downloader;
- llama.cpp adapter;
- hardware detection и рекомендации GPU/CPU;
- installer;
- персональный словарь;
- embeddings/history search.
