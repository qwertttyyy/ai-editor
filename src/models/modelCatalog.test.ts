import { describe, expect, it } from "vitest";

import { ModelManager } from "./ModelManager";
import { ModelStorage } from "./ModelStorage";
import { localModelCatalog } from "./modelCatalog";
import { getDefaultModel, getModelsForLanguage } from "./modelSelection";

describe("ModelCatalog", () => {
  it("contains the selected local model profiles", () => {
    expect(localModelCatalog.map((model) => model.displayName)).toEqual([
      "Qwen3-0.6B",
      "Qwen3-1.7B",
      "Ruadapt Qwen2.5 1.5B",
      "Ruadapt Qwen2.5 3B",
      "Qwen3-4B",
      "Qwen3-8B",
    ]);
  });

  it("marks Qwen3-4B as the default model", () => {
    expect(getDefaultModel(localModelCatalog)).toMatchObject({
      id: "qwen3-4b",
      displayName: "Qwen3-4B",
      isDefault: true,
    });
  });

  it("recommends Ruadapt models for Russian only", () => {
    const russianModels = getModelsForLanguage(localModelCatalog, "ru");
    const englishModels = getModelsForLanguage(localModelCatalog, "en");

    expect(russianModels.map((model) => model.id)).toContain("ruadapt-qwen2.5-1.5b");
    expect(russianModels.map((model) => model.id)).toContain("ruadapt-qwen2.5-3b");
    expect(englishModels.map((model) => model.id)).not.toContain("ruadapt-qwen2.5-1.5b");
    expect(englishModels.map((model) => model.id)).not.toContain("ruadapt-qwen2.5-3b");
  });

  it("uses llama-cpp runtime for every catalog model", () => {
    expect(localModelCatalog.every((model) => model.runtime === "llama-cpp")).toBe(true);
  });

  it("keeps models without verified artifacts as catalog-only", () => {
    for (const model of localModelCatalog) {
      expect(model.artifact).toBeUndefined();
      expect(model.availability).toBe("catalog-only");
    }
  });

  it("does not contain empty model ids or display names", () => {
    for (const model of localModelCatalog) {
      expect(model.id.trim()).not.toBe("");
      expect(model.displayName.trim()).not.toBe("");
    }
  });
});

describe("ModelManager and ModelStorage", () => {
  it("returns the default model", () => {
    const manager = new ModelManager();

    expect(manager.getDefaultModel().id).toBe("qwen3-4b");
  });

  it("does not require real files in unit tests", () => {
    const storage = new ModelStorage({ baseDirectory: "/tmp/ai-editor-models" });
    const defaultModel = getDefaultModel(localModelCatalog);

    expect(storage.getModelDirectory(defaultModel)).toBe(
      "/tmp/ai-editor-models/qwen3-4b",
    );
    expect(storage.getModelFilePath(defaultModel)).toBeNull();
    expect(storage.hasModelFile(defaultModel)).toBe(false);
  });
});
