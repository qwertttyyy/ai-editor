import type { InferenceRequest, InferenceResponse } from "../inference/InferenceAdapter";
import type { ModelRuntimeKind } from "../models/modelTypes";

export type RuntimeReadiness = "not-ready" | "ready";

export type RuntimeProcessStatus = "stopped" | "starting" | "running" | "failed";

export type RuntimeNotReadyReason =
  | "sidecar-missing"
  | "model-missing"
  | "process-stopped"
  | "health-check-failed"
  | "not-implemented";

export interface RuntimeBinaryStatus {
  runtime: ModelRuntimeKind;
  isBundled: boolean;
  isInstalled: boolean;
  executablePath?: string;
  expectedBinaryName?: string;
}

export interface RuntimeStartRequest {
  modelId: string;
  modelPath: string;
  port?: number;
}

export interface RuntimeHealthStatus {
  runtime: ModelRuntimeKind;
  readiness: RuntimeReadiness;
  message: string;
  status?: RuntimeProcessStatus;
  reason?: RuntimeNotReadyReason;
  endpoint?: string;
}

export interface RuntimeCompletionRequest extends InferenceRequest {
  modelId: string;
}

export type RuntimeCompletionResponse = InferenceResponse;
