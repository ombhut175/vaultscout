import { Injectable, Logger } from "@nestjs/common";
import { HuggingfaceService } from "../../huggingface/huggingface.service";

interface EmbeddingResult {
  embeddings: number[];
  model: string;
  timestamp: string;
}

@Injectable()
export class EmbeddingsService {
  private readonly logger = new Logger(EmbeddingsService.name);

  constructor(private readonly hfService: HuggingfaceService) {}

  async embedQuery(text: string): Promise<EmbeddingResult> {
    const prefixedText = `query: ${text}`;

    this.logger.log("Embedding query text", {
      operation: "embedQuery",
      originalLength: text.length,
      prefixedLength: prefixedText.length,
      timestamp: new Date().toISOString(),
    });

    try {
      const result = await this.hfService.extractFeatures({
        text: prefixedText,
      });

      return {
        embeddings: result.embeddings,
        model: result.model,
        timestamp: result.timestamp,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      this.logger.error("Failed to embed query", {
        operation: "embedQuery",
        error: errorMessage,
      });
      throw error;
    }
  }

  async embedPassage(text: string): Promise<EmbeddingResult> {
    if (!text || typeof text !== "string") {
      throw new Error("Text must be a non-empty string");
    }

    if (text.trim().length === 0) {
      throw new Error("Text cannot be empty or whitespace only");
    }

    const prefixedText = `passage: ${text}`;

    this.logger.log("Embedding single passage", {
      operation: "embedPassage",
      textLength: text.length,
      timestamp: new Date().toISOString(),
    });

    try {
      const result = await this.hfService.extractFeatures({
        text: prefixedText,
      });

      return {
        embeddings: result.embeddings,
        model: result.model,
        timestamp: result.timestamp,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      this.logger.error("Failed to embed passage", {
        operation: "embedPassage",
        textLength: text.length,
        error: errorMessage,
      });
      throw error;
    }
  }

  async embedPassages(texts: string[]): Promise<EmbeddingResult[]> {
    if (!texts || texts.length === 0) {
      throw new Error("Texts array cannot be empty");
    }

    if (texts.length > 100) {
      throw new Error(
        `Batch size ${texts.length} exceeds recommended limit of 100 texts per batch`,
      );
    }

    const totalLength = texts.reduce((sum, t) => sum + (t?.length || 0), 0);

    this.logger.log("Embedding passages", {
      operation: "embedPassages",
      count: texts.length,
      totalLength,
      timestamp: new Date().toISOString(),
    });

    try {
      const results: EmbeddingResult[] = [];
      const failedIndices: { index: number; error: string }[] = [];

      for (let i = 0; i < texts.length; i++) {
        const text = texts[i];

        if (!text || typeof text !== "string") {
          this.logger.warn("Skipping invalid text at index", {
            operation: "embedPassages",
            index: i,
            type: typeof text,
          });
          failedIndices.push({
            index: i,
            error: `Invalid text at index ${i}: not a string`,
          });
          continue;
        }

        if (text.trim().length === 0) {
          this.logger.warn("Skipping empty text at index", {
            operation: "embedPassages",
            index: i,
          });
          failedIndices.push({
            index: i,
            error: `Empty text at index ${i}`,
          });
          continue;
        }

        try {
          const prefixedText = `passage: ${text}`;
          const result = await this.hfService.extractFeatures({
            text: prefixedText,
          });

          results.push({
            embeddings: result.embeddings,
            model: result.model,
            timestamp: result.timestamp,
          });
        } catch (itemError) {
          const msg =
            itemError instanceof Error ? itemError.message : "Unknown error";
          this.logger.warn("Failed to embed individual passage", {
            operation: "embedPassages",
            index: i,
            textLength: text.length,
            error: msg,
          });
          failedIndices.push({
            index: i,
            error: msg,
          });
        }
      }

      if (failedIndices.length > 0) {
        this.logger.warn("Some passages failed embedding", {
          operation: "embedPassages",
          totalCount: texts.length,
          successCount: results.length,
          failedCount: failedIndices.length,
          failedIndices,
        });
      }

      this.logger.log("Passages embedded successfully", {
        operation: "embedPassages",
        requestedCount: texts.length,
        successCount: results.length,
        timestamp: new Date().toISOString(),
      });

      return results;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      this.logger.error("Failed to embed passages", {
        operation: "embedPassages",
        count: texts.length,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  }
}
