# Autocomplete Codemap

## Что сейчас есть

Autocomplete работает локально через `DictionarySuggestionProvider`. Он использует встроенный curated dictionary русских и английских слов и prefix-фраз, не обращается к сети и не зависит от Ollama, llama.cpp, model manager или runtime manager.

Dictionary по умолчанию:

- включён через code config;
- работает в language mode `auto` через controller;
- предлагает слова и фразы только по strict prefix;
- не использует includes matching;
- не предлагает exact prefix как полезную подсказку;
- вставляет только недостающий хвост через `insertText`;
- держит n-gram triggers выключенными через `enableNgrams: false`.

## Runtime flow

```text
Editor UI
  -> EditorAutocompleteController
  -> AutocompleteService
  -> DictionarySuggestionProvider
  -> dictionary scoring / entries
```

## Главные файлы

- `src/autocomplete/SuggestionProvider.ts` — provider contract и `rankingMode`.
- `src/autocomplete/types.ts` — `SuggestionRequest`, `Suggestion`, ranges.
- `src/shared/language.ts` — `SupportedLanguage`, `LanguageMode`, display label.
- `src/autocomplete/textContext.ts` — language-aware prefix detection.
- `src/autocomplete/AutocompleteService.ts` — service orchestration, fallback policy, ranking mode handling.
- `src/autocomplete/ranking.ts` — generic ranking/dedupe для service-ranked providers.
- `src/autocomplete/DisabledSuggestionProvider.ts` — empty provider для code config `dictionary.enabled: false`.
- `src/autocomplete/dictionary/DictionarySuggestionProvider.ts` — dictionary provider.
- `src/autocomplete/dictionary/dictionaryEntries.ts` — curated `ru/en` words/phrases.
- `src/autocomplete/dictionary/dictionaryScoring.ts` — prefix scoring, frequency rank, dedupe, `insertText`.
- `src/autocomplete/dictionary/dictionaryTextContext.ts` — prefix/phrase context extraction.
- `src/autocomplete/OllamaSuggestionProvider.ts` — optional/dev placeholder, не production runtime path.

## Что читать для задач

- Изменить словарь: `dictionaryEntries.ts`, затем tests provider-а.
- Изменить matching/scoring: `dictionaryScoring.ts`, `dictionaryTextContext.ts`.
- Изменить fallback: `AutocompleteService.ts`, `AutocompleteService.test.ts`.
- Отключить или настроить dictionary: `src/app/autocompleteConfig.ts`, `createAutocompleteService.ts`.
- Готовить LLM provider: `SuggestionProvider.ts`, `AutocompleteService.ts`, inference/runtime docs/code.

## Инварианты

- UI не вызывает providers напрямую.
- Provider не должен обращаться к сети, если это dictionary.
- Empty result по умолчанию остаётся empty и не подменяется случайными подсказками.
- Error fallback включается только явной policy.
- Dictionary suggestions должны быть предсказуемыми: strict prefix, без нерелевантных phrase includes.
- Фразы остаются prefix-completion, а не LLM-style continuation.
- Русские и английские prefix не смешиваются внутри одного token.
- В режиме `auto` кириллица даёт `ru`, латиница даёт `en`, отсутствие prefix даёт idle/no suggestions.
- Для completion вставки использовать `insertText`, если нужно дописать только хвост.

## Тесты

- `src/autocomplete/AutocompleteService.test.ts`
- `src/autocomplete/dictionary/DictionarySuggestionProvider.test.ts`
- `src/app/createAutocompleteService.test.ts`
- `src/app/EditorAutocompleteController.test.ts`
