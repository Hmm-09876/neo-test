import dns from "dns";
import { InferenceClient } from "@huggingface/inference";

dns.setDefaultResultOrder("ipv4first");

export class HuggingFaceDetectorClient {
  constructor({ apiToken, model = "roberta-base-openai-detector", provider = "auto" } = {}) {
    if (!apiToken) throw new Error("HF API token required (set HF_API_TOKEN env var)");
    this.client = new InferenceClient(apiToken);
    this.model = model;
    this.provider = provider;
  }

  async detect(chunk, { idempotencyKey } = {}) {
    const out = await this.client.textClassification({
      model: this.model,
      inputs: chunk,
      provider: this.provider,
    });

    if (Array.isArray(out) && out.length > 0) {
      const top = out[0];
      return { label: top.label, score: top.score ?? null, raw: out };
    }
    return { label: null, score: null, raw: out };
  }
}
