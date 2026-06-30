export interface InferenceRequest {
  prompt: string;
}

export interface InferenceResponse {
  text: string;
}

export interface InferenceAdapter {
  readonly name: string;
  complete(request: InferenceRequest): Promise<InferenceResponse>;
}
