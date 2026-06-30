import type { LocalModelDefinition } from "../models/modelTypes";
import type { HardwareProfile } from "./hardwareTypes";

export type HardwareModelCompatibility = "recommended" | "compatible" | "not-recommended";

export function getModelHardwareCompatibility(
  model: LocalModelDefinition,
  profile: HardwareProfile,
): HardwareModelCompatibility {
  switch (model.recommendedHardware) {
    case "cpu-low":
      return "recommended";
    case "cpu":
      return isLowCoreCpu(profile) ? "compatible" : "recommended";
    case "gpu-or-strong-cpu":
      return hasGpuBackend(profile) || hasStrongCpu(profile)
        ? "recommended"
        : "not-recommended";
  }
}

export function sortModelsForHardware(
  models: readonly LocalModelDefinition[],
  profile: HardwareProfile,
): LocalModelDefinition[] {
  return [...models].sort((left, right) => {
    const leftScore = compatibilityScore(getModelHardwareCompatibility(left, profile));
    const rightScore = compatibilityScore(getModelHardwareCompatibility(right, profile));

    if (leftScore !== rightScore) {
      return rightScore - leftScore;
    }

    return tierScore(left) - tierScore(right);
  });
}

function hasGpuBackend(profile: HardwareProfile): boolean {
  return profile.gpus.some((gpu) => gpu.backend !== "cpu" && gpu.backend !== "unknown");
}

function hasStrongCpu(profile: HardwareProfile): boolean {
  return (profile.cpu.logicalCores ?? 0) >= 8;
}

function isLowCoreCpu(profile: HardwareProfile): boolean {
  const logicalCores = profile.cpu.logicalCores;

  return logicalCores !== undefined && logicalCores < 4;
}

function compatibilityScore(compatibility: HardwareModelCompatibility): number {
  switch (compatibility) {
    case "recommended":
      return 2;
    case "compatible":
      return 1;
    case "not-recommended":
      return 0;
  }
}

function tierScore(model: LocalModelDefinition): number {
  switch (model.tier) {
    case "very-fast-cpu":
      return 0;
    case "fast-cpu":
      return 1;
    case "russian-cpu":
      return 2;
    case "balanced":
      return 3;
    case "quality":
      return 4;
  }
}
