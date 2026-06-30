# ai-editor

`ai-editor` — локальный desktop-текстовый редактор с автокомплитом слов, фраз и коротких продолжений на русском и английском языке.

Проект задуман как лёгкий, стабильный и приятный редактор в стиле IDE: пользователь пишет текст, а приложение ненавязчиво предлагает продолжения, которые можно выбрать стрелками и принять клавишей `Tab`.

## Статус

Проект находится в состоянии `early pet project`.

Сейчас репозиторий содержит первый scaffold приложения и контекст для дальнейшей агентной разработки. Приложение ещё не production-ready.

## Текущее состояние

В проекте есть первый вертикальный срез:

- desktop-приложение на Tauri 2;
- React UI на TypeScript;
- редактор на CodeMirror 6;
- верхняя панель, центральная область редактора и нижняя status-панель;
- светлая и тёмная тема;
- быстрый локальный dictionary autocomplete русских и английских слов и prefix-фраз без Ollama и сети;
- выбор подсказки стрелками вверх/вниз;
- принятие подсказки через `Tab`;
- базовая архитектура `AutocompleteService` и `SuggestionProvider`;
- основа managed `llama.cpp` runtime architecture: model catalog, model manager, model storage и runtime manager skeleton;
- модели пока только описаны в catalog; автоматическое скачивание, проверка и запуск будут отдельной следующей задачей;
- тесты для чистой autocomplete-логики.

Дальнейшие изменения задаются отдельными задачами с собственным scope, ограничениями и acceptance criteria.

## Планируемый стек

- Tauri 2
- React
- TypeScript
- CodeMirror 6
- bundled llama.cpp sidecar через model/runtime/inference слой
- Vitest
- ESLint
- Prettier
- npm

## Запуск

Доступные команды:

```bash
npm install
npm run dev
npm run build
npm run typecheck
npm run lint
npm run test
npm run check
```

Для нативных Tauri-команд на Ubuntu 24.04 нужны системные зависимости Tauri/GTK:

```bash
sudo apt install -y pkg-config libdbus-1-dev libwebkit2gtk-4.1-dev build-essential curl wget file libxdo-dev libssl-dev libayatana-appindicator3-dev librsvg2-dev
```

В целевой архитектуре пользователь не должен вручную устанавливать Ollama. Локальный LLM runtime будет управляться приложением через bundled llama.cpp sidecar, когда эта часть будет реализована.

## Документация

- `AGENTS.md` — строгие правила для Codex и других coding agents.
- `docs/PROJECT_OVERVIEW.md` — идея проекта простыми словами.
- `docs/TASK_SPEC_TEMPLATE.md` — шаблон спецификации отдельной задачи.
- `docs/CONTEXT_BUDGET.md` — правила выбора контекста перед задачей.
- `docs/ARCHITECTURE.md` — целевая архитектура приложения.
- `docs/UI_DESIGN_GUIDE.md` — визуальный стиль интерфейса.
- `docs/CODING_STANDARDS.md` — стандарты кода.
- `docs/TESTING_STRATEGY.md` — стратегия тестирования.
- `docs/AGENT_WORKFLOW.md` — рабочий процесс с агентами.
- `docs/TASK_PROMPT_TEMPLATE.md` — шаблон будущих задач.
- `docs/ROADMAP.md` — дорожная карта.
- `docs/SECURITY_AND_PERMISSIONS.md` — правила безопасности.
- `docs/DECISIONS/` — ADR с архитектурными решениями.
