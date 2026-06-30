import { localModelCatalog } from "./modelCatalog";
import { getDefaultModel } from "./modelSelection";
import { ModelStorage } from "./ModelStorage";
import type {
  LocalModelDefinition,
  ManagedModel,
  ManagedModelStatus,
} from "./modelTypes";

export class ModelManager {
  private readonly modelStatuses = new Map<string, ManagedModelStatus>();

  constructor(
    private readonly catalog: readonly LocalModelDefinition[] = localModelCatalog,
    private readonly storage: ModelStorage = new ModelStorage(),
  ) {}

  listModels(): ManagedModel[] {
    return this.catalog.map((definition) => ({
      definition,
      status: this.getModelStatus(definition.id),
    }));
  }

  getDefaultModel(): LocalModelDefinition {
    return getDefaultModel(this.catalog);
  }

  getModelStatus(modelId: string): ManagedModelStatus {
    const explicitStatus = this.modelStatuses.get(modelId);

    if (explicitStatus) {
      return explicitStatus;
    }

    const model = this.catalog.find((definition) => definition.id === modelId);

    if (!model) {
      return "failed";
    }

    if (this.storage.hasModelFile(model)) {
      return "installed";
    }

    return model.availability;
  }

  setModelStatus(modelId: string, status: ManagedModelStatus): void {
    this.modelStatuses.set(modelId, status);
  }
}
