# ai-editor

`ai-editor` — локальный desktop-текстовый редактор с автокомплитом слов, фраз и коротких продолжений предложений на русском языке.

Проект задуман как лёгкий, стабильный и приятный редактор в стиле IDE: пользователь пишет текст, а приложение ненавязчиво предлагает продолжения, которые можно выбрать стрелками и принять клавишей `Tab`.

## Статус

Проект находится в состоянии `early pet project`.

Сейчас репозиторий подготовлен для дальнейшей агентной разработки: здесь есть контекст, правила, архитектурные решения и шаблоны задач. Само приложение ещё не scaffolded и не production-ready.

## MVP 1

В MVP 1 планируется:

- desktop-приложение на Tauri 2;
- React UI на TypeScript;
- редактор на CodeMirror 6;
- верхняя панель, центральная область редактора и нижняя status-панель;
- светлая и тёмная тема;
- mock/dictionary autocomplete;
- выбор подсказки стрелками вверх/вниз;
- принятие подсказки через `Tab`;
- базовая архитектура `AutocompleteService` и `SuggestionProvider`;
- тесты для чистой autocomplete-логики.

MVP 1 не включает production installer, скачивание моделей, сложный менеджер файлов, аккаунты, облачную синхронизацию, telemetry и полноценную систему плагинов.

## Планируемый стек

- Tauri 2
- React
- TypeScript
- CodeMirror 6
- Ollama adapter
- Vitest
- ESLint
- Prettier
- npm

## Будущий запуск

После scaffold проекта ожидаются команды:

```bash
npm install
npm run dev
npm run build
npm run typecheck
npm run lint
npm run test
npm run check
```

Пока scaffold не создан, эти команды могут отсутствовать. Если команда ещё не существует, это не ошибка реализации приложения: проект просто находится на подготовительном этапе.

## Документация

- `AGENTS.md` — строгие правила для Codex и других coding agents.
- `docs/PROJECT_OVERVIEW.md` — идея проекта простыми словами.
- `docs/MVP_1_SCOPE.md` — границы MVP 1 и acceptance criteria.
- `docs/ARCHITECTURE.md` — целевая архитектура приложения.
- `docs/UI_DESIGN_GUIDE.md` — визуальный стиль интерфейса.
- `docs/CODING_STANDARDS.md` — стандарты кода.
- `docs/TESTING_STRATEGY.md` — стратегия тестирования.
- `docs/AGENT_WORKFLOW.md` — рабочий процесс с агентами.
- `docs/TASK_PROMPT_TEMPLATE.md` — шаблон будущих задач.
- `docs/ROADMAP.md` — дорожная карта.
- `docs/SECURITY_AND_PERMISSIONS.md` — правила безопасности.
- `docs/DECISIONS/` — ADR с архитектурными решениями.
