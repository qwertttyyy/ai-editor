import { describe, expect, it } from "vitest";

import { localModelCatalog } from "../models/modelCatalog";
import { createSafeCpuHardwareProfile } from "./HardwareProfile";
import {
  getModelHardwareCompatibility,
  sortModelsForHardware,
} from "./modelHardwareRecommendation";
import type { HardwareProfile } from "./hardwareTypes";

describe("hardware model recommendations", () => {
  it("uses safe CPU fallback when no hardware details are available", () => {
    const profile = createSafeCpuHardwareProfile();
    const qwenTiny = localModelCatalog.find((model) => model.id === "qwen3-0.6b")!;
    const qwenQuality = localModelCatalog.find((model) => model.id === "qwen3-8b")!;

    expect(profile.preferredBackend).toBe("cpu");
    expect(profile.safeFallback).toBe(true);
    expect(getModelHardwareCompatibility(qwenTiny, profile)).toBe("recommended");
    expect(getModelHardwareCompatibility(qwenQuality, profile)).toBe("not-recommended");
  });

  it("treats strong CPU as enough for gpu-or-strong-cpu models", () => {
    const profile = createSafeCpuHardwareProfile({
      architecture: "x64",
      logicalCores: 12,
    });
    const qwenQuality = localModelCatalog.find((model) => model.id === "qwen3-8b")!;

    expect(getModelHardwareCompatibility(qwenQuality, profile)).toBe("recommended");
  });

  it("treats GPU backend as enough for quality models", () => {
    const profile: HardwareProfile = {
      ...createSafeCpuHardwareProfile({ architecture: "arm64", logicalCores: 4 }),
      gpus: [
        {
          id: "gpu-0",
          vendor: "apple",
          backend: "metal",
          vramBytes: 8 * 1024 * 1024 * 1024,
        },
      ],
      preferredBackend: "metal",
      safeFallback: false,
    };
    const qwenQuality = localModelCatalog.find((model) => model.id === "qwen3-8b")!;

    expect(getModelHardwareCompatibility(qwenQuality, profile)).toBe("recommended");
  });

  it("sorts CPU fallback recommendations before quality-only models", () => {
    const profile = createSafeCpuHardwareProfile({ logicalCores: 2 });
    const sortedModelIds = sortModelsForHardware(localModelCatalog, profile).map(
      (model) => model.id,
    );

    expect(sortedModelIds.indexOf("qwen3-0.6b")).toBeLessThan(
      sortedModelIds.indexOf("qwen3-8b"),
    );
  });
});
