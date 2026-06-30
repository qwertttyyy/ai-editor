import type {
  InferenceAdapter,
  InferenceRequest,
  InferenceResponse,
} from "./InferenceAdapter";

export class OllamaInferenceAdapter implements InferenceAdapter {
  readonly name = "ollama";

  async complete(request: InferenceRequest): Promise<InferenceResponse> {
    void request;
    throw new Error("OllamaInferenceAdapter is reserved for MVP 2+.");
  }
}
