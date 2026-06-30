import { ModelStorage, type ModelStorageInfo } from "./ModelStorage";

export type TauriInvoke = <T>(
  command: string,
  args?: Record<string, unknown>,
) => Promise<T>;

export interface ModelStorageInfoProvider {
  getStorageInfo(): Promise<ModelStorageInfo>;
}

export class StaticModelStorageInfoProvider implements ModelStorageInfoProvider {
  constructor(private readonly storageInfo: ModelStorageInfo) {}

  async getStorageInfo(): Promise<ModelStorageInfo> {
    return this.storageInfo;
  }
}

export class TauriModelStorageInfoProvider implements ModelStorageInfoProvider {
  constructor(private readonly invoke: TauriInvoke) {}

  async getStorageInfo(): Promise<ModelStorageInfo> {
    return this.invoke<ModelStorageInfo>("get_model_storage_info");
  }
}

export async function createModelStorageFromProvider(
  provider: ModelStorageInfoProvider,
): Promise<ModelStorage> {
  const storageInfo = await provider.getStorageInfo();

  return new ModelStorage({
    baseDirectory: storageInfo.modelsDirectory,
  });
}
