import { LlamaCppRuntimeAdapter } from "./LlamaCppRuntimeAdapter";
import {
  createInitialRuntimeProcessState,
  type RuntimeProcessState,
} from "./RuntimeProcessState";
import type {
  RuntimeBinaryStatus,
  RuntimeHealthStatus,
  RuntimeStartRequest,
} from "./runtimeTypes";

export class RuntimeManager {
  private state: RuntimeProcessState;

  constructor(private readonly adapter = new LlamaCppRuntimeAdapter()) {
    this.state = createInitialRuntimeProcessState("llama-cpp");
  }

  getState(): RuntimeProcessState {
    return this.state;
  }

  getBinaryStatus(): RuntimeBinaryStatus {
    return this.adapter.getBinaryStatus();
  }

  async checkBinaryStatus(): Promise<RuntimeBinaryStatus> {
    return this.adapter.checkBinaryStatus();
  }

  canStart(modelPath: string | null | undefined): boolean {
    const binaryStatus = this.getBinaryStatus();

    return binaryStatus.isInstalled && Boolean(modelPath);
  }

  async checkHealth(): Promise<RuntimeHealthStatus> {
    return this.adapter.checkHealth();
  }

  async start(request: RuntimeStartRequest): Promise<RuntimeProcessState> {
    if (!this.canStart(request.modelPath)) {
      const binaryStatus = this.getBinaryStatus();
      const missingSidecar = !binaryStatus.isInstalled;
      this.state = {
        runtime: "llama-cpp",
        status: "failed",
        readiness: "not-ready",
        modelId: request.modelId,
        modelPath: request.modelPath,
        errorMessage: missingSidecar
          ? "llama.cpp sidecar is not bundled yet."
          : "Model file is not installed yet.",
      };
      return this.state;
    }

    this.state = {
      runtime: "llama-cpp",
      status: "starting",
      readiness: "not-ready",
      modelId: request.modelId,
      modelPath: request.modelPath,
    };
    this.state = await this.adapter.start(request);
    return this.state;
  }

  async stop(): Promise<RuntimeProcessState> {
    this.state = await this.adapter.stop();
    return this.state;
  }
}
