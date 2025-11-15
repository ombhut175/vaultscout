import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { Pinecone } from "@pinecone-database/pinecone";
import { ENV } from "../../../common/constants/string-const";

interface UpsertOptions {
  namespace?: string;
}

interface FetchOptions {
  namespace?: string;
}

interface DeleteOptions {
  namespace?: string;
}

@Injectable()
export class VectorIndexService implements OnModuleInit {
  private readonly logger = new Logger(VectorIndexService.name);
  private pc: Pinecone | undefined;
  private indexName: string | undefined;

  onModuleInit(): void {
    this.initializeClient();
  }

  private initializeClient(): void {
    const apiKey = process.env[ENV.PINECONE_API_KEY];
    this.indexName = process.env[ENV.PINECONE_INDEX_NAME];

    if (!apiKey || !this.indexName) {
      this.logger.warn(
        "Pinecone configuration missing. Set PINECONE_API_KEY and PINECONE_INDEX_NAME",
      );
      return;
    }

    try {
      this.pc = new Pinecone({
        apiKey,
      });

      this.logger.log("Pinecone client initialized successfully", {
        operation: "initializeClient",
        indexName: this.indexName,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      this.logger.error("Failed to initialize Pinecone client", {
        operation: "initializeClient",
        error: errorMessage,
      });
      throw error;
    }
  }

  private getIndex() {
    if (!this.pc || !this.indexName) {
      throw new Error("Pinecone client not initialized");
    }
    return this.pc.index(this.indexName);
  }

  async upsertChunks(
    ids: string[],
    vectors: number[][],
    metadata?: Record<string, unknown>[],
    options: UpsertOptions = {},
  ): Promise<string> {
    const namespace = options.namespace || "";

    this.logger.debug("Validating upsert input", {
      operation: "upsertChunks",
      idsLength: ids.length,
      vectorsLength: vectors.length,
      metadataLength: metadata?.length,
    });

    if (!ids || ids.length === 0) {
      throw new Error("ids array cannot be empty");
    }

    if (!vectors || vectors.length === 0) {
      throw new Error("vectors array cannot be empty");
    }

    if (ids.length !== vectors.length) {
      throw new Error(
        `Array length mismatch: ids (${ids.length}) vs vectors (${vectors.length})`,
      );
    }

    if (metadata && metadata.length !== ids.length) {
      throw new Error(
        `Metadata length (${metadata.length}) must match ids and vectors (${ids.length})`,
      );
    }

    if (ids.length > 1000) {
      throw new Error(
        `Batch size exceeds limit: ${ids.length}/1000 (Pinecone max batch size)`,
      );
    }

    this.logger.log("Upserting vectors to Pinecone", {
      operation: "upsertChunks",
      vectorCount: ids.length,
      namespace,
      timestamp: new Date().toISOString(),
    });

    try {
      const records = ids.map((id, index) => {
        const vector = vectors[index];

        if (!vector || !Array.isArray(vector)) {
          throw new Error(`Invalid vector at index ${index}: must be array`);
        }

        if (vector.length === 0) {
          throw new Error(`Empty vector at index ${index}`);
        }

        return {
          id,
          values: vector,
          metadata: (metadata?.[index] || {}) as any,
        };
      });

      const index = this.getIndex();
      await index.namespace(namespace).upsert(records as any);

      this.logger.log("Vectors upserted successfully", {
        operation: "upsertChunks",
        upsertedCount: ids.length,
        namespace,
        timestamp: new Date().toISOString(),
      });

      return `${ids.length} vectors upserted`;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      this.logger.error("Failed to upsert vectors", {
        operation: "upsertChunks",
        vectorCount: ids.length,
        namespace,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  }

  async fetchVectors(
    ids: string[],
    options: FetchOptions = {},
  ): Promise<any[]> {
    const namespace = options.namespace || "";

    if (!ids || ids.length === 0) {
      throw new Error("ids array cannot be empty");
    }

    this.logger.log("Fetching vectors from Pinecone", {
      operation: "fetchVectors",
      vectorCount: ids.length,
      namespace,
      timestamp: new Date().toISOString(),
    });

    try {
      const index = this.getIndex();
      const response = await index.namespace(namespace).fetch(ids);

      const records = Object.values(response.records || {});

      this.logger.log("Vectors fetched successfully", {
        operation: "fetchVectors",
        fetchedCount: records.length,
        namespace,
        timestamp: new Date().toISOString(),
      });

      return records;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      this.logger.error("Failed to fetch vectors", {
        operation: "fetchVectors",
        vectorCount: ids.length,
        namespace,
        error: errorMessage,
      });
      throw error;
    }
  }

  async deleteVectors(
    ids: string[],
    options: DeleteOptions = {},
  ): Promise<number> {
    const namespace = options.namespace || "";

    if (!ids || ids.length === 0) {
      throw new Error("ids array cannot be empty");
    }

    this.logger.log("Deleting vectors from Pinecone", {
      operation: "deleteVectors",
      vectorCount: ids.length,
      namespace,
      timestamp: new Date().toISOString(),
    });

    try {
      const index = this.getIndex();
      await index.namespace(namespace).deleteMany(ids);

      this.logger.log("Vectors deleted successfully", {
        operation: "deleteVectors",
        deletedCount: ids.length,
        namespace,
        timestamp: new Date().toISOString(),
      });

      return ids.length;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      this.logger.error("Failed to delete vectors", {
        operation: "deleteVectors",
        vectorCount: ids.length,
        namespace,
        error: errorMessage,
      });
      throw error;
    }
  }
}
