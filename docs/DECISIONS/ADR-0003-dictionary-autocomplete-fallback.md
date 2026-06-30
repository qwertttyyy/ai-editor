# ADR-0003: Dictionary autocomplete и fallback policy

## Статус

Принято.

## Контекст

Первый реальный autocomplete provider должен работать локально, быстро, без Ollama, сети и внешних NLP-библиотек. Старые scaffold-подсказки создавали шум и могли показывать нерелевантные варианты при пустом результате.

## Решение

Primary provider приложения — `DictionarySuggestionProvider`.

Он использует небольшой встроенный curated dictionary русских слов и фраз. По умолчанию dictionary работает как strict prefix completion: подсказка должна начинаться с введённого текста, а вставляется только недостающий хвост. Контекстные n-граммные triggers остаются выключенными через code config, чтобы словарь не забивал место для будущих LLM-продолжений.

`AutocompleteService` различает пустой результат и ошибку provider:

- empty result по умолчанию возвращается как `empty` без fallback-подсказок;
- fallback provider вызывается только если это явно включено через policy;
- ошибка primary provider не должна ломать ввод текста.

Runtime scaffold provider удалён. Для тестов fallback можно использовать локальные test providers внутри самих тестов.

## Последствия

- Приложение показывает dictionary suggestions без Ollama и сети.
- Empty state не подменяется случайными подсказками.
- Будущие history/LLM providers можно подключать через тот же `SuggestionProvider` contract.
