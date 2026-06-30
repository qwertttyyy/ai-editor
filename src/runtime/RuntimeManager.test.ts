import { describe, expect, it } from "vitest";

import { LlamaCppRuntimeAdapter } from "./LlamaCppRuntimeAdapter";
import { TauriLlamaCppRuntimeHost } from "./RuntimeHost";
import { RuntimeManager } from "./RuntimeManager";

describe("RuntimeManager", () => {
  it("returns stopped and not-ready initial state", () => {
    const manager = new RuntimeManager();

    expect(manager.getState()).toEqual({
      runtime: "llama-cpp",
      status: "stopped",
      readiness: "not-ready",
    });
    expect(manager.getBinaryStatus()).toEqual({
      runtime: "llama-cpp",
      isBundled: false,
      isInstalled: false,
      expectedBinaryName: "llama-server",
    });
  });

  it("does not claim it can start without a bundled sidecar and model path", () => {
    const manager = new RuntimeManager();

    expect(manager.canStart(null)).toBe(false);
    expect(manager.canStart("/models/qwen3-4b.gguf")).toBe(false);
  });

  it("moves to failed and not-ready when start is requested before sidecar packaging", async () => {
    const manager = new RuntimeManager();

    await expect(
      manager.start({
        modelId: "qwen3-4b",
        modelPath: "/models/qwen3-4b.gguf",
      }),
    ).resolves.toEqual({
      runtime: "llama-cpp",
      status: "failed",
      readiness: "not-ready",
      modelId: "qwen3-4b",
      modelPath: "/models/qwen3-4b.gguf",
      errorMessage: "llama.cpp sidecar is not bundled yet.",
    });
  });

  it("exposes planned runtime health status", async () => {
    const manager = new RuntimeManager();

    await expect(manager.checkHealth()).resolves.toEqual({
      runtime: "llama-cpp",
      readiness: "not-ready",
      status: "stopped",
      reason: "sidecar-missing",
      message: "Bundled llama.cpp sidecar is not packaged yet.",
    });
  });
});

describe("LlamaCppRuntimeAdapter", () => {
  it("reports not-ready health before sidecar packaging", async () => {
    const adapter = new LlamaCppRuntimeAdapter();

    await expect(adapter.checkHealth()).resolves.toEqual({
      runtime: "llama-cpp",
      readiness: "not-ready",
      status: "stopped",
      reason: "sidecar-missing",
      message: "Bundled llama.cpp sidecar is not packaged yet.",
    });
  });

  it("does not provide completion before sidecar packaging", async () => {
    const adapter = new LlamaCppRuntimeAdapter();

    await expect(adapter.complete({ prompt: "hello" })).rejects.toThrow(
      "llama.cpp completion is planned after sidecar packaging.",
    );
  });

  it("can delegate health checks to a Tauri runtime host", async () => {
    const host = new TauriLlamaCppRuntimeHost(
      async <T>(command: string, args?: Record<string, unknown>): Promise<T> => {
        if (command === "get_llama_cpp_sidecar_status") {
          expect(args).toBeUndefined();

          return {
            runtime: "llama-cpp",
            isBundled: false,
            isInstalled: false,
            expectedBinaryName: "llama-server",
          } as T;
        }

        expect(command).toBe("check_llama_cpp_runtime_health");
        expect(args).toEqual({ port: 11435 });

        return {
          runtime: "llama-cpp",
          readiness: "not-ready",
          status: "stopped",
          reason: "process-stopped",
          endpoint: "http://127.0.0.1:11435/health",
          message: "llama.cpp health endpoint is not reachable: connect failed",
        } as T;
      },
    );
    const adapter = new LlamaCppRuntimeAdapter(host);

    await expect(adapter.checkBinaryStatus()).resolves.toEqual({
      runtime: "llama-cpp",
      isBundled: false,
      isInstalled: false,
      expectedBinaryName: "llama-server",
    });
    await expect(adapter.checkHealth()).resolves.toMatchObject({
      runtime: "llama-cpp",
      readiness: "not-ready",
      reason: "process-stopped",
    });
  });
});
