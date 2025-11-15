import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Logger,
  Query,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiConsumes,
  ApiProduces,
} from "@nestjs/swagger";
import { SearchService } from "./services/search.service";
import { VectorIndexService } from "./services/vector-index.service";
import { IndexAdminService } from "./services/index-admin.service";
import { EmbeddingsService } from "./services/embeddings.service";
import {
  SearchQueryDto,
  UpsertChunkDto,
  FetchVectorsDto,
  StoreTextDto,
} from "./dto";
import { successResponse } from "../../common/helpers/api-response.helper";
import { MESSAGES } from "../../common/constants/string-const";

@ApiTags("pinecone")
@Controller("pinecone")
export class PineconeController {
  private readonly logger = new Logger(PineconeController.name);

  constructor(
    private readonly searchService: SearchService,
    private readonly vectorIndexService: VectorIndexService,
    private readonly indexAdminService: IndexAdminService,
    private readonly embeddingsService: EmbeddingsService,
  ) {}

  @Post("search")
  @ApiConsumes("application/json")
  @ApiProduces("application/json")
  @ApiOperation({
    summary: "Vector semantic search in Pinecone",
    description:
      'Performs semantic similarity search using embeddings. Query is automatically converted to embedding using BGE model with "query:" prefix for optimal similarity matching.',
    tags: ["Vector Search"],
  })
  @ApiBody({
    type: SearchQueryDto,
    description:
      "Search query parameters with optional filtering and namespace",
    examples: {
      basicSearch: {
        summary: "Basic semantic search (returns top 5 matches)",
        description: "Simple query without filters, defaults to top 10 results",
        value: {
          query: "How do I reset my password?",
          topK: 5,
        },
      },
      filteredSearch: {
        summary: "Search with metadata filter",
        description:
          "Search within specific category using MongoDB-style filter syntax",
        value: {
          query: "billing information",
          topK: 10,
          filter: { category: { $eq: "help" } },
          namespace: "support-docs",
        },
      },
      namespaceSearch: {
        summary: "Search in specific namespace",
        description: "Query isolated data within a specific namespace",
        value: {
          query: "enterprise pricing",
          topK: 20,
          namespace: "pricing-tier-premium",
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: "Search completed successfully with matched vectors",
    schema: {
      type: "object",
      properties: {
        statusCode: { type: "number", example: 200 },
        success: { type: "boolean", example: true },
        message: {
          type: "string",
          example: "Vector search successful",
        },
        data: {
          type: "object",
          properties: {
            matches: {
              type: "array",
              description:
                "Ranked results sorted by similarity score (highest first)",
              items: {
                type: "object",
                properties: {
                  id: {
                    type: "string",
                    example: "chunk-doc-001",
                    description: "Unique vector ID",
                  },
                  score: {
                    type: "number",
                    example: 0.9523,
                    description: "Similarity score (0-1, higher is better)",
                  },
                  metadata: {
                    type: "object",
                    example: { title: "FAQ", source: "docs.pdf", page: 5 },
                    description: "Associated metadata stored with vector",
                  },
                },
              },
            },
            query: {
              type: "string",
              example: "How do I reset my password?",
              description: "Original query string",
            },
            matchCount: {
              type: "number",
              example: 5,
              description: "Number of matches returned",
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: "Invalid request parameters",
    schema: {
      example: {
        statusCode: 400,
        message: "Query cannot be empty",
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: "Server error during search",
    schema: {
      example: {
        statusCode: 500,
        message: "Pinecone client not initialized",
      },
    },
  })
  async search(@Body() dto: SearchQueryDto) {
    this.logger.log("Search request received", {
      operation: "search",
      queryLength: dto.query.length,
      topK: dto.topK,
      namespace: dto.namespace,
    });

    try {
      const results = await this.searchService.vectorSearch({
        query: dto.query,
        topK: dto.topK || 10,
        filter: dto.filter,
        namespace: dto.namespace,
      });

      return successResponse(
        {
          matches: results,
          query: dto.query,
          matchCount: results.length,
        },
        MESSAGES.PINECONE_SEARCH_SUCCESS,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      this.logger.error("Search failed", {
        operation: "search",
        error: errorMessage,
      });
      throw error;
    }
  }

  @Post("store-text")
  @ApiConsumes("application/json")
  @ApiProduces("application/json")
  @ApiOperation({
    summary: "Convert text to embedding and store in Pinecone",
    description:
      "Accepts plain text, automatically converts it to embedding using BGE model with 'passage:' prefix, and stores in Pinecone. Returns the stored vector ID and embedding metadata.",
    tags: ["Data Management"],
  })
  @ApiBody({
    type: StoreTextDto,
    description: "Text content to embed and store with optional metadata",
    examples: {
      basicStore: {
        summary: "Store text with auto-generated ID",
        description: "Simple text storage with automatic ID generation",
        value: {
          text: "How do I reset my password on my account?",
        },
      },
      storeWithMetadata: {
        summary: "Store text with metadata",
        description: "Text storage with custom metadata",
        value: {
          text: "Enterprise pricing starts at $1000/month with volume discounts",
          id: "pricing-faq-001",
          metadata: {
            category: "pricing",
            source: "faq.pdf",
            page: 5,
            updated_at: new Date().toISOString(),
          },
        },
      },
      storeInNamespace: {
        summary: "Store text in specific namespace",
        description: "Namespace-isolated text storage for multi-tenant use",
        value: {
          text: "API documentation for endpoints",
          id: "tenant-1-doc-001",
          metadata: { tenant_id: "tenant-1" },
          namespace: "tenant-1-docs",
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: "Text converted to embedding and stored successfully",
    schema: {
      type: "object",
      properties: {
        statusCode: { type: "number", example: 200 },
        success: { type: "boolean", example: true },
        message: {
          type: "string",
          example: "Text embedded and stored successfully",
        },
        data: {
          type: "object",
          properties: {
            id: {
              type: "string",
              example: "vec-1234567890abcdef",
              description: "Vector ID (auto-generated if not provided)",
            },
            text: {
              type: "string",
              example: "How do I reset my password on my account?",
              description: "Original text that was embedded",
            },
            embedding: {
              type: "object",
              properties: {
                dimensions: {
                  type: "number",
                  example: 1024,
                  description: "Embedding vector dimensions",
                },
                magnitude: {
                  type: "number",
                  example: 1.0,
                  description: "Vector magnitude after normalization",
                },
                normalized: {
                  type: "boolean",
                  example: true,
                  description:
                    "Whether embedding was normalized for cosine similarity",
                },
              },
            },
            metadata: {
              type: "object",
              example: { category: "faq" },
              description: "Associated metadata stored with vector",
            },
            namespace: {
              type: "string",
              example: "default",
              description: "Namespace where vector was stored",
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: "Invalid request (empty text, etc)",
    schema: {
      example: {
        statusCode: 400,
        message: "Text cannot be empty or whitespace only",
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: "Server error during embedding or storage",
    schema: {
      example: {
        statusCode: 500,
        message: "Failed to embed text",
      },
    },
  })
  async storeText(@Body() dto: StoreTextDto) {
    const vectorId =
      dto.id ||
      `vec-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

    this.logger.log("Store text request received", {
      operation: "storeText",
      textLength: dto.text.length,
      vectorId,
      namespace: dto.namespace || "default",
    });

    try {
      const embeddingResult = await this.embeddingsService.embedPassage(
        dto.text,
      );

      this.logger.log("Text embedded successfully", {
        operation: "storeText",
        vectorId,
        dimensions: embeddingResult.embeddings.length,
      });

      const upsertResult = await this.vectorIndexService.upsertChunks(
        [vectorId],
        [embeddingResult.embeddings],
        [dto.metadata || {}],
        { namespace: dto.namespace || "" },
      );

      this.logger.log("Text stored in Pinecone", {
        operation: "storeText",
        vectorId,
        upsertResult,
      });

      return successResponse(
        {
          id: vectorId,
          text: dto.text,
          embedding: {
            dimensions: embeddingResult.embeddings.length,
            magnitude: Math.sqrt(
              embeddingResult.embeddings.reduce(
                (sum, val) => sum + val * val,
                0,
              ),
            ),
            normalized: true,
          },
          metadata: dto.metadata || {},
          namespace: dto.namespace || "default",
        },
        "Text embedded and stored successfully",
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      this.logger.error("Store text failed", {
        operation: "storeText",
        vectorId,
        error: errorMessage,
      });
      throw error;
    }
  }

  @Post("upsert")
  @ApiConsumes("application/json")
  @ApiProduces("application/json")
  @ApiOperation({
    summary: "Upsert vectors into Pinecone index",
    description:
      "Inserts or updates vectors (up to 1000 per batch). Vectors with existing IDs will be updated. Max 2MB payload size per request.",
    tags: ["Data Management"],
  })
  @ApiBody({
    type: UpsertChunkDto,
    description:
      "Batch of vectors with IDs and optional metadata. Arrays must have equal lengths.",
    examples: {
      basicUpsert: {
        summary: "Upsert document chunks with metadata",
        description: "Insert vectors with associated metadata for search",
        value: {
          ids: ["doc-chunk-001", "doc-chunk-002"],
          vectors: [
            [0.1, 0.2, 0.3, 0.4, 0.5],
            [0.5, 0.4, 0.3, 0.2, 0.1],
          ],
          metadata: [
            { title: "Section 1", source: "manual.pdf", page: 1 },
            { title: "Section 2", source: "manual.pdf", page: 2 },
          ],
        },
      },
      batchUpsert: {
        summary: "Large batch upsert (approaching limit)",
        description:
          "Upsert maximum recommended batch size with varied metadata",
        value: {
          ids: Array.from({ length: 100 }, (_, i) => `vec-${i}`),
          vectors: Array.from({ length: 100 }, () =>
            Array.from({ length: 1024 }, () => Math.random()),
          ),
          metadata: Array.from({ length: 100 }, (_, i) => ({
            chunk_index: i,
            document_id: "doc-123",
            created_at: new Date().toISOString(),
          })),
          namespace: "documents",
        },
      },
      namespaceUpsert: {
        summary: "Upsert to specific namespace",
        description: "Insert vectors into isolated namespace for multi-tenancy",
        value: {
          ids: ["tenant-1-vec-1"],
          vectors: [[0.1, 0.2, 0.3]],
          metadata: [{ tenant_id: "tenant-1", document_type: "invoice" }],
          namespace: "tenant-1-namespace",
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: "Vectors upserted successfully",
    schema: {
      type: "object",
      properties: {
        statusCode: { type: "number", example: 200 },
        success: { type: "boolean", example: true },
        message: {
          type: "string",
          example: MESSAGES.PINECONE_UPSERT_SUCCESS,
        },
        data: {
          type: "object",
          properties: {
            message: {
              type: "string",
              example: "100 vectors upserted",
              description: "Summary of upsert operation",
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: "Invalid request (array mismatch, batch too large, etc)",
    schema: {
      example: {
        statusCode: 400,
        message: "Array length mismatch: ids (10) vs vectors (9)",
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: "Server error during upsert",
    schema: {
      example: {
        statusCode: 500,
        message: "Batch size exceeds limit: 1500/1000",
      },
    },
  })
  async upsert(@Body() dto: UpsertChunkDto) {
    this.logger.log("Upsert request received", {
      operation: "upsert",
      vectorCount: dto.ids.length,
      namespace: dto.namespace,
    });

    try {
      const result = await this.vectorIndexService.upsertChunks(
        dto.ids,
        dto.vectors,
        dto.metadata,
        { namespace: dto.namespace },
      );

      return successResponse(
        { message: result },
        MESSAGES.PINECONE_UPSERT_SUCCESS,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      this.logger.error("Upsert failed", {
        operation: "upsert",
        vectorCount: dto.ids.length,
        error: errorMessage,
      });
      throw error;
    }
  }

  @Post("fetch")
  @ApiConsumes("application/json")
  @ApiProduces("application/json")
  @ApiOperation({
    summary: "Fetch vectors by IDs",
    description:
      "Retrieves vectors and their complete metadata from Pinecone by vector IDs. Maximum 100 IDs per request.",
    tags: ["Data Management"],
  })
  @ApiBody({
    type: FetchVectorsDto,
    description: "List of vector IDs to retrieve from a specific namespace",
    examples: {
      singleFetch: {
        summary: "Fetch single vector",
        description: "Retrieve one vector with its metadata",
        value: {
          ids: ["vec-doc-001"],
          namespace: "documents",
        },
      },
      multiFetch: {
        summary: "Fetch multiple vectors",
        description: "Retrieve several vectors from same namespace",
        value: {
          ids: ["vec-1", "vec-2", "vec-3", "vec-4", "vec-5"],
          namespace: "documents",
        },
      },
      defaultNamespace: {
        summary: "Fetch from default namespace",
        description: "Retrieve vectors from default empty namespace",
        value: {
          ids: ["global-vec-1", "global-vec-2"],
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: "Vectors retrieved successfully",
    schema: {
      type: "object",
      properties: {
        statusCode: { type: "number", example: 200 },
        success: { type: "boolean", example: true },
        message: {
          type: "string",
          example: MESSAGES.PINECONE_FETCH_SUCCESS,
        },
        data: {
          type: "object",
          properties: {
            vectors: {
              type: "array",
              description: "Array of vector objects with values and metadata",
              items: {
                type: "object",
                properties: {
                  id: { type: "string", example: "vec-1" },
                  values: {
                    type: "array",
                    items: { type: "number" },
                    example: [0.1, 0.2, 0.3],
                  },
                  metadata: { type: "object" },
                },
              },
            },
            count: {
              type: "number",
              example: 3,
              description: "Number of vectors returned",
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: "Invalid IDs array",
    schema: {
      example: {
        statusCode: 400,
        message: "Maximum 100 vectors per fetch request (recommended)",
      },
    },
  })
  async fetch(@Body() dto: FetchVectorsDto) {
    this.logger.log("Fetch request received", {
      operation: "fetch",
      vectorCount: dto.ids.length,
      namespace: dto.namespace,
    });

    try {
      const vectors = await this.vectorIndexService.fetchVectors(dto.ids, {
        namespace: dto.namespace,
      });

      return successResponse(
        { vectors, count: vectors.length },
        MESSAGES.PINECONE_FETCH_SUCCESS,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      this.logger.error("Fetch failed", {
        operation: "fetch",
        vectorCount: dto.ids.length,
        error: errorMessage,
      });
      throw error;
    }
  }

  @Delete("vectors")
  @ApiProduces("application/json")
  @ApiOperation({
    summary: "Delete vectors by IDs",
    description:
      "Removes vectors from Pinecone index using comma-separated IDs in query string. Supports namespace isolation.",
    tags: ["Data Management"],
  })
  @ApiResponse({
    status: 200,
    description: "Vectors deleted successfully",
    schema: {
      type: "object",
      properties: {
        statusCode: { type: "number", example: 200 },
        success: { type: "boolean", example: true },
        message: {
          type: "string",
          example: MESSAGES.PINECONE_DELETE_SUCCESS,
        },
        data: {
          type: "object",
          properties: {
            deletedCount: {
              type: "number",
              example: 3,
              description: "Number of vectors deleted",
            },
            message: {
              type: "string",
              example: "3 vectors deleted",
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: "Missing or invalid query parameters",
    schema: {
      example: {
        statusCode: 400,
        message:
          "ids query parameter is required and must contain comma-separated IDs",
      },
    },
  })
  async deleteVectors(
    @Query("ids") idsParam: string,
    @Query("namespace") namespace = "",
  ) {
    const ids = idsParam?.split(",").map((id) => id.trim()) || [];

    if (!ids || ids.length === 0) {
      throw new Error(
        "ids query parameter is required and must contain comma-separated IDs",
      );
    }

    this.logger.log("Delete request received", {
      operation: "deleteVectors",
      vectorCount: ids.length,
      namespace,
    });

    try {
      const deletedCount = await this.vectorIndexService.deleteVectors(ids, {
        namespace,
      });

      return successResponse(
        { deletedCount, message: `${deletedCount} vectors deleted` },
        MESSAGES.PINECONE_DELETE_SUCCESS,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      this.logger.error("Delete failed", {
        operation: "deleteVectors",
        vectorCount: ids.length,
        error: errorMessage,
      });
      throw error;
    }
  }

  @Get("index/stats")
  @ApiProduces("application/json")
  @ApiOperation({
    summary: "Get index statistics and metrics",
    description:
      "Retrieves comprehensive statistics about the Pinecone index: vector dimensions, fullness percentage, total vector count, and per-namespace record counts. Use for monitoring and capacity planning.",
    tags: ["Monitoring"],
  })
  @ApiResponse({
    status: 200,
    description: "Index statistics retrieved successfully",
    schema: {
      type: "object",
      properties: {
        statusCode: { type: "number", example: 200 },
        success: { type: "boolean", example: true },
        message: {
          type: "string",
          example: "Index statistics retrieved successfully",
        },
        data: {
          type: "object",
          properties: {
            dimension: {
              type: "number",
              example: 1024,
              description:
                "Vector embedding dimension (should match model output)",
            },
            indexFullness: {
              type: "number",
              example: 0.65,
              description:
                "Index fullness percentage (0-1, affects performance)",
            },
            totalRecordCount: {
              type: "number",
              example: 10000,
              description: "Total number of vectors across all namespaces",
            },
            namespaces: {
              type: "object",
              example: {
                "": { recordCount: 5000 },
                documents: { recordCount: 3000 },
                faqs: { recordCount: 2000 },
              },
              description: "Record count breakdown by namespace",
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: "Failed to retrieve statistics",
  })
  async getIndexStats() {
    this.logger.log("Get index stats request", { operation: "getIndexStats" });

    try {
      const stats = await this.indexAdminService.getIndexStats();
      return successResponse(stats, "Index statistics retrieved successfully");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      this.logger.error("Failed to get index stats", { error: errorMessage });
      throw error;
    }
  }

  @Get("namespaces")
  @ApiProduces("application/json")
  @ApiOperation({
    summary: "List all namespaces in Pinecone index",
    description:
      "Retrieves all namespaces currently in use within the Pinecone index.",
  })
  @ApiResponse({
    status: 200,
    description: "Namespaces listed successfully",
    schema: {
      type: "object",
      properties: {
        statusCode: { type: "number", example: 200 },
        success: { type: "boolean", example: true },
        message: { type: "string" },
        data: {
          type: "object",
          properties: {
            namespaces: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  vectorCount: { type: "number" },
                },
              },
            },
            count: { type: "number" },
          },
        },
      },
    },
  })
  async listNamespaces() {
    this.logger.log("List namespaces request", { operation: "listNamespaces" });

    try {
      const namespaces = await this.indexAdminService.listNamespaces();
      return successResponse(
        { namespaces, count: namespaces.length },
        "Namespaces listed successfully",
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      this.logger.error("Failed to list namespaces", { error: errorMessage });
      throw error;
    }
  }

  @Get("health")
  @ApiProduces("application/json")
  @ApiOperation({
    summary: "Health check for Pinecone connection",
    description:
      "Verifies Pinecone connectivity and index readiness. Returns connection status, index name, and total vector count. Non-blocking diagnostic endpoint.",
    tags: ["Monitoring"],
  })
  @ApiResponse({
    status: 200,
    description: "Connection health status",
    schema: {
      type: "object",
      properties: {
        statusCode: { type: "number", example: 200 },
        success: { type: "boolean", example: true },
        message: {
          type: "string",
          example: "Connection health check completed",
        },
        data: {
          type: "object",
          properties: {
            connected: {
              type: "boolean",
              example: true,
              description: "Whether Pinecone client is connected",
            },
            indexReady: {
              type: "boolean",
              example: true,
              description: "Whether index is ready for operations",
            },
            indexName: {
              type: "string",
              example: "vaultscout-index",
              description: "Name of the connected Pinecone index",
            },
            message: {
              type: "string",
              example: "Index is ready with 15234 vectors",
              description: "Human-readable status message",
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: "Connection failed (graceful failure)",
    schema: {
      example: {
        statusCode: 200,
        success: true,
        data: {
          connected: false,
          indexReady: false,
          indexName: null,
          message: "Connection failed: Invalid API key",
        },
      },
    },
  })
  async verifyConnection() {
    this.logger.log("Health check request", { operation: "verifyConnection" });

    const result = await this.indexAdminService.verifyConnection();
    return successResponse(result, "Connection health check completed");
  }
}
