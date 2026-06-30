import { LlamaCppRuntimeAdapter } from "./LlamaCppRuntimeAdapter";
import {
  createInitialRuntimeProcessState,
  type RuntimeProcessState,
} from "./RuntimeProcessState";
import type { RuntimeBinaryStatus, RuntimeStartRequest } from "./runtimeTypes";

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

  canStart(modelPath: string | null | undefined): boolean {
    const binaryStatus = this.getBinaryStatus();

    return binaryStatus.isInstalled && Boolean(modelPath);
  }

  async start(request: RuntimeStartRequest): Promise<RuntimeProcessState> {
    if (!this.canStart(request.modelPath)) {
      this.state = {
        runtime: "llama-cpp",
        status: "failed",
        readiness: "not-ready",
        modelId: request.modelId,
        modelPath: request.modelPath,
        errorMessage: "llama.cpp sidecar is not bundled yet.",
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
