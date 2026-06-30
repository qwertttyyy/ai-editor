import type { InferenceRequest, InferenceResponse } from "../inference/InferenceAdapter";
import type { ModelRuntimeKind } from "../models/modelTypes";

export type RuntimeReadiness = "not-ready" | "ready";

export interface RuntimeBinaryStatus {
  runtime: ModelRuntimeKind;
  isBundled: boolean;
  isInstalled: boolean;
  executablePath?: string;
}

export interface RuntimeStartRequest {
  modelId: string;
  modelPath: string;
}

export interface RuntimeHealthStatus {
  runtime: ModelRuntimeKind;
  readiness: RuntimeReadiness;
  message: string;
}

export interface RuntimeCompletionRequest extends InferenceRequest {
  modelId: string;
}

export type RuntimeCompletionResponse = InferenceResponse;
