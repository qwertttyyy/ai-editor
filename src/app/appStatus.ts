import { getDefaultModel } from "../models/modelSelection";
import { localModelCatalog } from "../models/modelCatalog";
import { formatLanguageMode } from "../shared/language";
import { autocompleteConfig, type AutocompleteConfig } from "./autocompleteConfig";

export interface AppStatusSnapshot {
  runtimeLabel: string;
  modelLabel: string;
  languageLabel: string;
}

export function getAppStatusSnapshot(
  config: AutocompleteConfig = autocompleteConfig,
): AppStatusSnapshot {
  const defaultModel = getDefaultModel(localModelCatalog);

  return {
    runtimeLabel: "llama.cpp planned",
    modelLabel: defaultModel.displayName,
    languageLabel: formatLanguageMode(config.languageMode),
  };
}
