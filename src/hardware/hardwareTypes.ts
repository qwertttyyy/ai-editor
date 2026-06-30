export type HardwarePlatform = "linux" | "macos" | "windows" | "unknown";

export type CpuArchitecture = "x64" | "arm64" | "x86" | "unknown";

export type GpuVendor = "nvidia" | "amd" | "apple" | "intel" | "unknown";

export type HardwareBackend =
  "cpu" | "cuda" | "metal" | "vulkan" | "directml" | "unknown";

export interface CpuInfo {
  architecture: CpuArchitecture;
  logicalCores?: number;
  brand?: string;
}

export interface GpuInfo {
  id: string;
  vendor: GpuVendor;
  backend: HardwareBackend;
  name?: string;
  vramBytes?: number;
}

export interface HardwareProfile {
  platform: HardwarePlatform;
  cpu: CpuInfo;
  gpus: readonly GpuInfo[];
  preferredBackend: HardwareBackend;
  safeFallback: boolean;
}

export interface HardwareDetectionAdapter {
  detect(): Promise<HardwareProfile>;
}
