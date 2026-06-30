import { describe, expect, it } from "vitest";

import { ModelManager } from "./ModelManager";
import { ModelStorage } from "./ModelStorage";
import {
  StaticModelStorageInfoProvider,
  createModelStorageFromProvider,
} from "./ModelStorageBridge";
import { localModelCatalog } from "./modelCatalog";
import { getDefaultModel, getModelsForLanguage } from "./modelSelection";
import type { LocalModelDefinition } from "./modelTypes";

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

  it("contains verified artifact metadata for the first downloadable model", () => {
    const model = localModelCatalog.find((definition) => definition.id === "qwen3-0.6b");

    expect(model).toMatchObject({
      availability: "downloadable",
      artifact: {
        format: "gguf",
        source: "hugging-face",
        repository: "Qwen/Qwen3-0.6B-GGUF",
        sourcePageUrl: "https://huggingface.co/Qwen/Qwen3-0.6B-GGUF",
        downloadUrl:
          "https://huggingface.co/Qwen/Qwen3-0.6B-GGUF/resolve/main/Qwen3-0.6B-Q8_0.gguf",
        fileName: "Qwen3-0.6B-Q8_0.gguf",
        sha256: "9465e63a22add5354d9bb4b99e90117043c7124007664907259bd16d043bb031",
        sizeBytes: 639446688,
        verifiedAt: "2026-06-30",
      },
    });
  });

  it("keeps models without verified artifacts as catalog-only", () => {
    for (const model of localModelCatalog.filter(
      (definition) => definition.id !== "qwen3-0.6b",
    )) {
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
    const downloadableModel = localModelCatalog[0];

    expect(storage.getModelDirectory(defaultModel)).toBe(
      "/tmp/ai-editor-models/qwen3-4b",
    );
    expect(storage.getModelFilePath(defaultModel)).toBeNull();
    expect(storage.hasModelFile(defaultModel)).toBe(false);
    expect(storage.getModelFilePath(downloadableModel)).toBe(
      "/tmp/ai-editor-models/qwen3-0.6b/Qwen3-0.6B-Q8_0.gguf",
    );
    expect(storage.getModelFileSnapshot(downloadableModel)).toEqual({
      modelId: "qwen3-0.6b",
      expectedFilePath: "/tmp/ai-editor-models/qwen3-0.6b/Qwen3-0.6B-Q8_0.gguf",
      status: "missing",
    });
  });

  it("can mark model files as present without scanning arbitrary directories", () => {
    const storage = new ModelStorage({
      baseDirectory: "/tmp/ai-editor-models",
      presentModelIds: ["qwen3-0.6b"],
    });

    expect(storage.hasModelFile(localModelCatalog[0])).toBe(true);
    expect(storage.getModelFileSnapshot(localModelCatalog[0]).status).toBe("present");
  });

  it("rejects unsafe artifact filenames", () => {
    const unsafeModel: LocalModelDefinition = {
      ...localModelCatalog[0],
      artifact: {
        ...localModelCatalog[0].artifact!,
        fileName: "../model.gguf",
      },
    };
    const storage = new ModelStorage({ baseDirectory: "/tmp/ai-editor-models" });

    expect(storage.getModelFilePath(unsafeModel)).toBeNull();
  });

  it("can create model storage from app data storage info provider", async () => {
    const provider = new StaticModelStorageInfoProvider({
      appDataDirectory: "/tmp/com.local.aieditor",
      modelsDirectory: "/tmp/com.local.aieditor/models",
    });

    const storage = await createModelStorageFromProvider(provider);

    expect(storage.getBaseDirectory()).toBe("/tmp/com.local.aieditor/models");
  });
});
