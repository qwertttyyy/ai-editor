import type { LocalModelDefinition } from "./modelTypes";

export interface ModelStorageOptions {
  baseDirectory?: string;
}

export class ModelStorage {
  private readonly baseDirectory: string;

  constructor(options: ModelStorageOptions = {}) {
    this.baseDirectory = options.baseDirectory ?? "<app-data>/models";
  }

  getBaseDirectory(): string {
    return this.baseDirectory;
  }

  getModelDirectory(model: LocalModelDefinition): string {
    return `${this.baseDirectory}/${model.id}`;
  }

  getModelFilePath(model: LocalModelDefinition): string | null {
    const fileName = model.artifact?.fileName;

    if (!fileName) {
      return null;
    }

    return `${this.getModelDirectory(model)}/${fileName}`;
  }

  hasModelFile(model: LocalModelDefinition): boolean {
    void model;
    return false;
  }
}
