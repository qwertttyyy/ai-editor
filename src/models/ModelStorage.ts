import type { LocalModelDefinition } from "./modelTypes";

export type ModelFileStatus = "missing" | "present" | "invalid";

export interface ModelStorageInfo {
  appDataDirectory: string;
  modelsDirectory: string;
}

export interface ModelFileSnapshot {
  modelId: string;
  expectedFilePath: string | null;
  status: ModelFileStatus;
}

export interface ModelStorageOptions {
  baseDirectory?: string;
  presentModelIds?: readonly string[];
}

export class ModelStorage {
  private readonly baseDirectory: string;
  private readonly presentModelIds: Set<string>;

  constructor(options: ModelStorageOptions = {}) {
    this.baseDirectory = options.baseDirectory ?? "<app-data>/models";
    this.presentModelIds = new Set(options.presentModelIds ?? []);
  }

  getBaseDirectory(): string {
    return this.baseDirectory;
  }

  getModelDirectory(model: LocalModelDefinition): string {
    if (!isSafePathSegment(model.id)) {
      throw new Error(`Unsafe model id: ${model.id}`);
    }

    return joinPath(this.baseDirectory, model.id);
  }

  getModelFilePath(model: LocalModelDefinition): string | null {
    const fileName = model.artifact?.fileName;

    if (!fileName) {
      return null;
    }

    if (!isSafeFileName(fileName)) {
      return null;
    }

    return joinPath(this.getModelDirectory(model), fileName);
  }

  hasModelFile(model: LocalModelDefinition): boolean {
    return this.presentModelIds.has(model.id) && this.getModelFilePath(model) !== null;
  }

  getModelFileSnapshot(model: LocalModelDefinition): ModelFileSnapshot {
    const expectedFilePath = this.getModelFilePath(model);

    if (!expectedFilePath) {
      return {
        modelId: model.id,
        expectedFilePath,
        status: "missing",
      };
    }

    return {
      modelId: model.id,
      expectedFilePath,
      status: this.hasModelFile(model) ? "present" : "missing",
    };
  }
}

function joinPath(basePath: string, pathSegment: string): string {
  const normalizedBasePath = basePath.replace(/[\\/]+$/, "");
  const normalizedSegment = pathSegment.replace(/^[\\/]+/, "");

  return `${normalizedBasePath}/${normalizedSegment}`;
}

function isSafePathSegment(segment: string): boolean {
  return /^[a-z0-9][a-z0-9._-]*$/i.test(segment) && !segment.includes("..");
}

function isSafeFileName(fileName: string): boolean {
  return (
    fileName.length > 0 &&
    !fileName.includes("..") &&
    !fileName.includes("/") &&
    !fileName.includes("\\")
  );
}
