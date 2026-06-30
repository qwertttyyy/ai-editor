import type {
  CpuArchitecture,
  HardwareDetectionAdapter,
  HardwarePlatform,
  HardwareProfile,
} from "./hardwareTypes";

export interface SafeCpuHardwareProfileOptions {
  platform?: HardwarePlatform;
  architecture?: CpuArchitecture;
  logicalCores?: number;
}

export function createSafeCpuHardwareProfile(
  options: SafeCpuHardwareProfileOptions = {},
): HardwareProfile {
  return {
    platform: options.platform ?? "unknown",
    cpu: {
      architecture: options.architecture ?? "unknown",
      logicalCores: options.logicalCores,
    },
    gpus: [],
    preferredBackend: "cpu",
    safeFallback: true,
  };
}

export class SafeFallbackHardwareDetectionAdapter implements HardwareDetectionAdapter {
  async detect(): Promise<HardwareProfile> {
    return createSafeCpuHardwareProfile();
  }
}

export type TauriHardwareInvoke = <T>(
  command: string,
  args?: Record<string, unknown>,
) => Promise<T>;

export class TauriHardwareDetectionAdapter implements HardwareDetectionAdapter {
  constructor(private readonly invoke: TauriHardwareInvoke) {}

  async detect(): Promise<HardwareProfile> {
    return this.invoke<HardwareProfile>("get_hardware_profile");
  }
}
