import type { ModelRuntimeKind } from "../models/modelTypes";
import type { RuntimeReadiness } from "./runtimeTypes";

export type RuntimeProcessStatus = "stopped" | "starting" | "running" | "failed";

export interface RuntimeProcessState {
  runtime: ModelRuntimeKind;
  status: RuntimeProcessStatus;
  readiness: RuntimeReadiness;
  modelId?: string;
  modelPath?: string;
  errorMessage?: string;
}

export function createInitialRuntimeProcessState(
  runtime: ModelRuntimeKind = "llama-cpp",
): RuntimeProcessState {
  return {
    runtime,
    status: "stopped",
    readiness: "not-ready",
  };
}
