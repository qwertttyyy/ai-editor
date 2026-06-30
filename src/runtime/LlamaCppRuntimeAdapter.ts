import type {
  InferenceAdapter,
  InferenceRequest,
  InferenceResponse,
} from "../inference/InferenceAdapter";
import type {
  RuntimeBinaryStatus,
  RuntimeHealthStatus,
  RuntimeStartRequest,
} from "./runtimeTypes";
import {
  createInitialRuntimeProcessState,
  type RuntimeProcessState,
} from "./RuntimeProcessState";

export class LlamaCppRuntimeAdapter implements InferenceAdapter {
  readonly name = "llama.cpp";

  getBinaryStatus(): RuntimeBinaryStatus {
    return {
      runtime: "llama-cpp",
      isBundled: false,
      isInstalled: false,
    };
  }

  async start(request: RuntimeStartRequest): Promise<RuntimeProcessState> {
    void request;
    return createInitialRuntimeProcessState("llama-cpp");
  }

  async stop(): Promise<RuntimeProcessState> {
    return createInitialRuntimeProcessState("llama-cpp");
  }

  async checkHealth(): Promise<RuntimeHealthStatus> {
    return {
      runtime: "llama-cpp",
      readiness: "not-ready",
      message: "Bundled llama.cpp sidecar is planned but not installed yet.",
    };
  }

  async complete(request: InferenceRequest): Promise<InferenceResponse> {
    void request;
    throw new Error("llama.cpp completion is planned after sidecar packaging.");
  }
}
