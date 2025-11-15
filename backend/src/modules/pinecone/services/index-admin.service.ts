import { Injectable, Logger } from "@nestjs/common";
import { Pinecone } from "@pinecone-database/pinecone";
import { ENV } from "../../../common/constants/string-const";

interface NamespaceInfo {
  name: string;
  vectorCount: number;
}

interface IndexStats {
  dimension: number;
  indexFullness: number;
  totalRecordCount: number;
  namespaces: Record<string, { recordCount: number }>;
}

interface VerifyConnectionResult {
  connected: boolean;
  indexReady: boolean;
  indexName: string | undefined;
  message: string;
}

@Injectable()
export class IndexAdminService {
  private readonly logger = new Logger(IndexAdminService.name);
  private pc: Pinecone | undefined;
  private indexName: string | undefined;

  constructor() {
    this.initializeClient();
  }

  private initializeClient(): void {
    const apiKey = process.env[ENV.PINECONE_API_KEY];
    this.indexName = process.env[ENV.PINECONE_INDEX_NAME];

    if (!apiKey || !this.indexName) {
      this.logger.warn("Pinecone configuration missing for IndexAdminService");
      return;
    }

    try {
      this.pc = new Pinecone({ apiKey });
      this.logger.log("IndexAdminService initialized", {
        indexName: this.indexName,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      this.logger.error("Failed to initialize Pinecone in IndexAdminService", {
        error: errorMessage,
      });
    }
  }

  async listNamespaces(): Promise<NamespaceInfo[]> {
    this.logger.log("Listing namespaces", {
      operation: "listNamespaces",
      timestamp: new Date().toISOString(),
    });

    try {
      if (!this.pc || !this.indexName) {
        throw new Error("Pinecone client not initialized");
      }

      const index = this.pc.index(this.indexName);
      const response = await index.listNamespaces();

      const namespaces: NamespaceInfo[] = Object.entries(
        response.namespaces || {},
      ).map(([name, info]) => ({
        name,
        vectorCount: (info as any)?.recordCount || 0,
      }));

      this.logger.log("Namespaces listed successfully", {
        operation: "listNamespaces",
        count: namespaces.length,
        timestamp: new Date().toISOString(),
      });

      return namespaces;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      this.logger.error("Failed to list namespaces", {
        operation: "listNamespaces",
        error: errorMessage,
      });
      throw error;
    }
  }

  async getIndexStats(): Promise<IndexStats> {
    this.logger.log("Getting index statistics", {
      operation: "getIndexStats",
      timestamp: new Date().toISOString(),
    });

    try {
      if (!this.pc || !this.indexName) {
        throw new Error("Pinecone client not initialized");
      }

      const index = this.pc.index(this.indexName);
      const stats = await index.describeIndexStats();

      const result: IndexStats = {
        dimension: stats.dimension || 0,
        indexFullness: stats.indexFullness || 0,
        totalRecordCount: stats.totalRecordCount || 0,
        namespaces: stats.namespaces || {},
      };

      this.logger.log("Index statistics retrieved successfully", {
        operation: "getIndexStats",
        dimension: result.dimension,
        totalRecordCount: result.totalRecordCount,
        namespaceCount: Object.keys(result.namespaces).length,
        timestamp: new Date().toISOString(),
      });

      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      this.logger.error("Failed to get index statistics", {
        operation: "getIndexStats",
        error: errorMessage,
      });
      throw error;
    }
  }

  async verifyConnection(): Promise<VerifyConnectionResult> {
    this.logger.log("Verifying Pinecone connection", {
      operation: "verifyConnection",
      timestamp: new Date().toISOString(),
    });

    try {
      if (!this.pc || !this.indexName) {
        return {
          connected: false,
          indexReady: false,
          indexName: this.indexName,
          message: "Pinecone client not initialized",
        };
      }

      const index = this.pc.index(this.indexName);
      const stats = await index.describeIndexStats();

      const result: VerifyConnectionResult = {
        connected: true,
        indexReady: true,
        indexName: this.indexName,
        message: `Index is ready with ${stats.totalRecordCount || 0} vectors`,
      };

      this.logger.log("Connection verified successfully", {
        operation: "verifyConnection",
        indexName: this.indexName,
        vectorCount: stats.totalRecordCount,
      });

      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";

      this.logger.error("Connection verification failed", {
        operation: "verifyConnection",
        error: errorMessage,
      });

      return {
        connected: false,
        indexReady: false,
        indexName: this.indexName,
        message: `Connection failed: ${errorMessage}`,
      };
    }
  }
}
