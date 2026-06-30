import type { SupportedLanguage } from "../shared/language";
import type { LocalModelDefinition } from "./modelTypes";

export function getDefaultModel(
  catalog: readonly LocalModelDefinition[],
): LocalModelDefinition {
  const defaultModel = catalog.find((model) => model.isDefault);

  if (defaultModel) {
    return defaultModel;
  }

  const firstModel = catalog[0];

  if (!firstModel) {
    throw new Error("Model catalog is empty.");
  }

  return firstModel;
}

export function findModelById(
  catalog: readonly LocalModelDefinition[],
  modelId: string,
): LocalModelDefinition | null {
  return catalog.find((model) => model.id === modelId) ?? null;
}

export function getModelsForLanguage(
  catalog: readonly LocalModelDefinition[],
  language: SupportedLanguage,
): LocalModelDefinition[] {
  return catalog.filter((model) => model.recommendedLanguages.includes(language));
}
