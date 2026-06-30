import type { RuntimeBinaryStatus, RuntimeHealthStatus } from "./runtimeTypes";

export const DEFAULT_LLAMA_CPP_HEALTH_PORT = 11435;

export interface RuntimeHost {
  getBinaryStatus(): RuntimeBinaryStatus;
  checkBinaryStatus(): Promise<RuntimeBinaryStatus>;
  checkHealth(port?: number): Promise<RuntimeHealthStatus>;
}

export class PlannedLlamaCppRuntimeHost implements RuntimeHost {
  getBinaryStatus(): RuntimeBinaryStatus {
    return {
      runtime: "llama-cpp",
      isBundled: false,
      isInstalled: false,
      expectedBinaryName: "llama-server",
    };
  }

  async checkBinaryStatus(): Promise<RuntimeBinaryStatus> {
    return this.getBinaryStatus();
  }

  async checkHealth(): Promise<RuntimeHealthStatus> {
    return {
      runtime: "llama-cpp",
      readiness: "not-ready",
      status: "stopped",
      reason: "sidecar-missing",
      message: "Bundled llama.cpp sidecar is not packaged yet.",
    };
  }
}

export type RuntimeInvoke = <T>(
  command: string,
  args?: Record<string, unknown>,
) => Promise<T>;

export class TauriLlamaCppRuntimeHost implements RuntimeHost {
  constructor(
    private readonly invoke: RuntimeInvoke,
    private readonly fallbackBinaryStatus: RuntimeBinaryStatus = {
      runtime: "llama-cpp",
      isBundled: false,
      isInstalled: false,
      expectedBinaryName: "llama-server",
    },
  ) {}

  getBinaryStatus(): RuntimeBinaryStatus {
    return this.fallbackBinaryStatus;
  }

  async checkBinaryStatus(): Promise<RuntimeBinaryStatus> {
    return this.invoke<RuntimeBinaryStatus>("get_llama_cpp_sidecar_status");
  }

  async checkHealth(port = DEFAULT_LLAMA_CPP_HEALTH_PORT): Promise<RuntimeHealthStatus> {
    return this.invoke<RuntimeHealthStatus>("check_llama_cpp_runtime_health", {
      port,
    });
  }
}
