import { Injectable, Logger } from "@nestjs/common";
import { InferenceClient } from "@huggingface/inference";
import { ENV } from "../../common/constants/string-const";
import {
  getEmbeddingMetadata,
  validateEmbeddingDimensions,
  EmbeddingMetadata,
} from "../../common/helpers/embedding.helper";

interface FeatureExtractionInput {
  text: string;
}

interface FeatureExtractionResponse {
  embeddings: number[];
  model: string;
  inputText: string;
  embeddingMetadata: EmbeddingMetadata;
  timestamp: string;
}

@Injectable()
export class HuggingfaceService {
  private readonly logger = new Logger(HuggingfaceService.name);
  private client: InferenceClient;
  private readonly defaultModel = "BAAI/bge-base-en-v1.5";
  private readonly shouldNormalize: boolean;
  private readonly expectedDimensions?: number;

  constructor() {
    const hfToken = process.env[ENV.HF_API_TOKEN];

    if (!hfToken) {
      this.logger.warn(
        "HF_API_TOKEN is not configured. Feature extraction will fail.",
      );
    }

    this.client = new InferenceClient(hfToken);

    const bgeNormalizeEnv = process.env[ENV.BGE_NORMALIZE];
    this.shouldNormalize =
      bgeNormalizeEnv === undefined || bgeNormalizeEnv === "true";

    const dimensionsEnv = process.env[ENV.EMBEDDING_DIMENSIONS];
    this.expectedDimensions = dimensionsEnv
      ? parseInt(dimensionsEnv, 10)
      : undefined;

    this.logger.log("HuggingFace service initialized", {
      model: this.defaultModel,
      normalize: this.shouldNormalize,
      expectedDimensions: this.expectedDimensions,
    });
  }

  async extractFeatures(
    input: FeatureExtractionInput,
  ): Promise<FeatureExtractionResponse> {
    const model = this.defaultModel;

    this.logger.log("Starting feature extraction", {
      operation: "extractFeatures",
      model,
      textLength: input.text.length,
      normalize: this.shouldNormalize,
      timestamp: new Date().toISOString(),
    });

    try {
      const output = await this.client.featureExtraction({
        model,
        inputs: input.text,
        provider: "hf-inference",
        normalize: this.shouldNormalize,
      });

      let embedding: number[] = [];
      if (Array.isArray(output)) {
        if (output.length > 0 && Array.isArray(output[0])) {
          embedding = output[0] as number[];
        } else if (typeof output[0] === "number") {
          embedding = (output as unknown as number[]) || [];
        }
      }

      if (!validateEmbeddingDimensions(embedding, this.expectedDimensions)) {
        const errorMsg = `Embedding dimensions mismatch. Expected: ${this.expectedDimensions}, Got: ${embedding.length}`;
        this.logger.error(errorMsg, {
          operation: "extractFeatures",
          model,
        });
        throw new Error(errorMsg);
      }

      const metadata = getEmbeddingMetadata(embedding, this.shouldNormalize);

      this.logger.log("Feature extraction completed successfully", {
        operation: "extractFeatures",
        model,
        dimensions: metadata.dimensions,
        magnitude: metadata.magnitude.toFixed(6),
        normalized: this.shouldNormalize,
        timestamp: new Date().toISOString(),
      });

      return {
        embeddings: embedding,
        model,
        inputText: input.text,
        embeddingMetadata: metadata,
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
