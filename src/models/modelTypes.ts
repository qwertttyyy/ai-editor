import type { SupportedLanguage } from "../shared/language";

export type ModelRuntimeKind = "llama-cpp";

export type ModelPerformanceTier =
  "very-fast-cpu" | "fast-cpu" | "russian-cpu" | "balanced" | "quality";

export type RecommendedHardware = "cpu-low" | "cpu" | "gpu-or-strong-cpu";

export type ModelAvailabilityStatus = "catalog-only" | "downloadable" | "installed";

export type ManagedModelStatus = ModelAvailabilityStatus | "downloading" | "failed";

export interface LocalModelArtifact {
  format: "gguf";
  source: "hugging-face";
  repository: string;
  sourcePageUrl: string;
  downloadUrl: string;
  fileName: string;
  sha256: string;
  sizeBytes: number;
  verifiedAt: string;
}

export interface LocalModelDefinition {
  id: string;
  displayName: string;
  family: "qwen3" | "ruadapt-qwen2.5";
  parameterSize: "0.6B" | "1.5B" | "1.7B" | "3B" | "4B" | "8B";
  recommendedLanguages: SupportedLanguage[];
  tier: ModelPerformanceTier;
  recommendedHardware: RecommendedHardware;
  isDefault?: boolean;
  runtime: ModelRuntimeKind;
  availability: ModelAvailabilityStatus;
  artifact?: LocalModelArtifact;
  notes: string;
}

export interface ManagedModel {
  definition: LocalModelDefinition;
  status: ManagedModelStatus;
}
