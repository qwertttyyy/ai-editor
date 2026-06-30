export type SupportedLanguage = "ru" | "en";

export type LanguageMode = "auto" | SupportedLanguage;

export function formatLanguageMode(languageMode: LanguageMode): string {
  if (languageMode === "auto") {
    return "Auto";
  }

  return languageMode.toUpperCase();
}
