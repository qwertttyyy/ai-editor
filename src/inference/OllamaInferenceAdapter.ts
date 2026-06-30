import type {
  InferenceAdapter,
  InferenceRequest,
  InferenceResponse,
} from "./InferenceAdapter";

export class OllamaInferenceAdapter implements InferenceAdapter {
  readonly name = "ollama-dev";

  async complete(request: InferenceRequest): Promise<InferenceResponse> {
    void request;
    throw new Error("OllamaInferenceAdapter is an optional dev adapter placeholder.");
  }
}
