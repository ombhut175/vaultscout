import { Controller, Post, Body, Logger } from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiConsumes,
  ApiProduces,
} from "@nestjs/swagger";
import { HuggingfaceService } from "./huggingface.service";
import { successResponse } from "../../common/helpers/api-response.helper";
import { IsString, IsNotEmpty, IsOptional } from "class-validator";

class FeatureExtractionDto {
  @IsString()
  @IsNotEmpty()
  text!: string;

  @IsOptional()
  @IsString()
  model?: string;
}

@ApiTags("huggingface")
@Controller("huggingface")
export class HuggingfaceController {
  private readonly logger = new Logger(HuggingfaceController.name);

  constructor(private readonly huggingfaceService: HuggingfaceService) {}

  @Post("extract-features")
  @ApiConsumes("application/json")
  @ApiProduces("application/json")
  @ApiOperation({
    summary: "Extract text embeddings using Hugging Face inference",
    description:
      "Converts input text into embeddings using a specified Hugging Face model. Supports feature extraction, semantic search, and text similarity use cases.",
  })
  @ApiBody({
    description: "Text extraction request payload",
    type: FeatureExtractionDto,
    examples: {
      example1: {
        summary: "Basic feature extraction",
        value: {
          text: "Today is a sunny day and I will get some ice cream.",
        },
      },
      example2: {
        summary: "Feature extraction with custom model",
        value: {
          text: "The quick brown fox jumps over the lazy dog",
          model: "sentence-transformers/all-MiniLM-L6-v2",
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: "Features extracted successfully",
    schema: {
      type: "object",
      properties: {
        statusCode: { type: "number", example: 200 },
        success: { type: "boolean", example: true },
        message: {
          type: "string",
          example: "Features extracted successfully",
        },
        data: {
          type: "object",
          properties: {
            embeddings: {
              type: "array",
              description:
                "Feature vector (embedding) from the model - 1D array of floats",
              items: { type: "number" },
              example: [
                0.123, -0.456, 0.789, 0.321, 0.101, -0.202, 0.303, -0.404,
              ],
            },
            model: {
              type: "string",
              description: "Model identifier used for feature extraction",
              example: "BAAI/bge-base-en-v1.5",
            },
            inputText: {
              type: "string",
              description: "The original input text that was processed",
              example: "Today is a sunny day and I will get some ice cream.",
            },
            embeddingMetadata: {
              type: "object",
              description: "Metadata about the embedding vector",
              properties: {
                dimensions: {
                  type: "number",
                  description: "Number of dimensions in the embedding vector",
                  example: 768,
                },
                magnitude: {
                  type: "number",
                  description:
                    "L2 norm (magnitude) of the embedding vector before normalization",
                  example: 1.0,
                },
                normalized: {
                  type: "boolean",
                  description:
                    "Whether the embedding was normalized using L2 normalization",
                  example: true,
                },
              },
              required: ["dimensions", "magnitude", "normalized"],
            },
            timestamp: {
              type: "string",
              format: "date-time",
              description: "ISO 8601 timestamp of when extraction occurred",
              example: "2024-01-01T12:34:56.789Z",
            },
          },
          required: [
            "embeddings",
            "model",
            "inputText",
            "embeddingMetadata",
            "timestamp",
          ],
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: "Validation failed - missing or invalid text field",
    schema: {
      type: "object",
      properties: {
        statusCode: { type: "number", example: 400 },
        message: {
          type: "array",
          items: { type: "string" },
          example: ["text must be a string", "text should not be empty"],
        },
        error: { type: "string", example: "Bad Request" },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: "Feature extraction failed - Hugging Face API error",
    schema: {
      type: "object",
      properties: {
        statusCode: { type: "number", example: 500 },
        message: {
          type: "string",
          example: "Failed to call Hugging Face inference endpoint",
        },
        timestamp: {
          type: "string",
          example: "2024-01-01T12:34:56.789Z",
        },
        path: { type: "string", example: "/api/huggingface/extract-features" },
      },
    },
  })
  async extractFeatures(@Body() dto: FeatureExtractionDto) {
    this.logger.log("Feature extraction request received", {
      operation: "extractFeatures",
      textLength: dto.text.length,
      model: dto.model || "default",
      timestamp: new Date().toISOString(),
    });

    try {
      const result = await this.huggingfaceService.extractFeatures({
        text: dto.text,
        model: dto.model,
      });

      this.logger.log("Feature extraction endpoint completed successfully", {
        operation: "extractFeatures",
        model: result.model,
        timestamp: new Date().toISOString(),
      });

      return successResponse(result, "Features extracted successfully");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      this.logger.error("Feature extraction endpoint failed", {
        operation: "extractFeatures",
        error: errorMessage,
        timestamp: new Date().toISOString(),
      });
      throw error;
    }
  }
}
