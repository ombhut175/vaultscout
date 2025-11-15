import { Injectable, Logger } from "@nestjs/common";
import {
  InferenceClient,
  FeatureExtractionOutput,
} from "@huggingface/inference";
import { ENV } from "../../common/constants/string-const";

interface FeatureExtractionInput {
  text: string;
  model?: string;
}

interface FeatureExtractionResponse {
  embeddings: FeatureExtractionOutput;
  model: string;
  inputText: string;
  timestamp: string;
}

@Injectable()
export class HuggingfaceService {
  private readonly logger = new Logger(HuggingfaceService.name);
  private client: InferenceClient;
  private readonly defaultModel = "BAAI/bge-base-en-v1.5";

  constructor() {
    const hfToken = process.env[ENV.HF_API_TOKEN];

    if (!hfToken) {
      this.logger.warn(
        "HF_API_TOKEN is not configured. Feature extraction will fail.",
      );
    }

    this.client = new InferenceClient(hfToken);
  }

  async extractFeatures(
    input: FeatureExtractionInput,
  ): Promise<FeatureExtractionResponse> {
    const model = input.model || this.defaultModel;

    this.logger.log("Starting feature extraction", {
      operation: "extractFeatures",
      model,
      textLength: input.text.length,
      timestamp: new Date().toISOString(),
    });

    try {
      const output = await this.client.featureExtraction({
        model,
        inputs: input.text,
        provider: "hf-inference",
      });

      let embeddingDimension = 0;
      if (Array.isArray(output)) {
        if (output.length > 0 && Array.isArray(output[0])) {
          embeddingDimension = output[0].length;
        } else if (typeof output[0] === "number") {
          embeddingDimension = output.length;
        }
      }

      this.logger.log("Feature extraction completed successfully", {
        operation: "extractFeatures",
        model,
        embeddingDimension,
        timestamp: new Date().toISOString(),
      });

      return {
        embeddings: output,
        model,
        inputText: input.text,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      this.logger.error("Feature extraction failed", {
        operation: "extractFeatures",
        model,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      });
      throw error;
    }
  }
}
