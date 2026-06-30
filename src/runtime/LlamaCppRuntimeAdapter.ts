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
import { PlannedLlamaCppRuntimeHost, type RuntimeHost } from "./RuntimeHost";
import {
  createInitialRuntimeProcessState,
  type RuntimeProcessState,
} from "./RuntimeProcessState";

export class LlamaCppRuntimeAdapter implements InferenceAdapter {
  readonly name = "llama.cpp";

  constructor(
    private readonly runtimeHost: RuntimeHost = new PlannedLlamaCppRuntimeHost(),
  ) {}

  getBinaryStatus(): RuntimeBinaryStatus {
    return this.runtimeHost.getBinaryStatus();
  }

  async checkBinaryStatus(): Promise<RuntimeBinaryStatus> {
    return this.runtimeHost.checkBinaryStatus();
  }

  async start(request: RuntimeStartRequest): Promise<RuntimeProcessState> {
    void request;
    return createInitialRuntimeProcessState("llama-cpp");
  }

  async stop(): Promise<RuntimeProcessState> {
    return createInitialRuntimeProcessState("llama-cpp");
  }

  async checkHealth(): Promise<RuntimeHealthStatus> {
    return this.runtimeHost.checkHealth();
  }

  async complete(request: InferenceRequest): Promise<InferenceResponse> {
    void request;
    throw new Error("llama.cpp completion is planned after sidecar packaging.");
  }
}
