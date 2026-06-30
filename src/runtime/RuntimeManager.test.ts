import { describe, expect, it } from "vitest";

import { LlamaCppRuntimeAdapter } from "./LlamaCppRuntimeAdapter";
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
});

describe("LlamaCppRuntimeAdapter", () => {
  it("reports not-ready health before sidecar packaging", async () => {
    const adapter = new LlamaCppRuntimeAdapter();

    await expect(adapter.checkHealth()).resolves.toEqual({
      runtime: "llama-cpp",
      readiness: "not-ready",
      message: "Bundled llama.cpp sidecar is planned but not installed yet.",
    });
  });

  it("does not provide completion before sidecar packaging", async () => {
    const adapter = new LlamaCppRuntimeAdapter();

    await expect(adapter.complete({ prompt: "hello" })).rejects.toThrow(
      "llama.cpp completion is planned after sidecar packaging.",
    );
  });
});
