import { Injectable, Logger } from "@nestjs/common";
import { Pinecone } from "@pinecone-database/pinecone";
import { EmbeddingsService } from "./embeddings.service";
import { ENV } from "../../../common/constants/string-const";

interface SearchOptions {
  query: string;
  topK?: number;
  filter?: Record<string, unknown>;
  namespace?: string;
}

interface SearchResult {
  id: string;
  score: number;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);
  private pc: Pinecone | undefined;
  private indexName: string | undefined;

  constructor(private readonly embeddingsService: EmbeddingsService) {
    this.initializeClient();
  }

  private initializeClient(): void {
    const apiKey = process.env[ENV.PINECONE_API_KEY];
    this.indexName = process.env[ENV.PINECONE_INDEX_NAME];

    if (!apiKey || !this.indexName) {
      this.logger.warn("Pinecone configuration missing for SearchService");
      return;
    }

    try {
      this.pc = new Pinecone({ apiKey });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      this.logger.error("Failed to initialize Pinecone in SearchService", {
        error: errorMessage,
      });
    }
  }

  async vectorSearch(options: SearchOptions): Promise<SearchResult[]> {
    const { query, topK = 10, filter, namespace = "__default__" } = options;

    this.logger.debug("Validating search input", {
      operation: "vectorSearch",
      queryLength: query?.length,
      topK,
      namespace,
    });

    if (!query || typeof query !== "string") {
      throw new Error("Query must be a non-empty string");
    }

    if (query.trim().length === 0) {
      throw new Error("Query cannot be empty");
    }

    if (topK < 1 || topK > 10000) {
      throw new Error("topK must be between 1 and 10000");
    }

    this.logger.log("Starting vector search", {
      operation: "vectorSearch",
      queryLength: query.length,
      topK,
      namespace,
      hasFilter: !!filter,
      timestamp: new Date().toISOString(),
    });

    try {
      if (!this.pc || !this.indexName) {
        throw new Error(
          "Pinecone client not initialized. Check PINECONE_API_KEY and PINECONE_INDEX_NAME",
        );
      }

      this.logger.debug("Embedding query", {
        operation: "vectorSearch",
        queryPreview: query.substring(0, 50),
      });

      const embeddingResult = await this.embeddingsService.embedQuery(query);

      this.logger.debug("Query embedded successfully", {
        operation: "vectorSearch",
        dimensions: embeddingResult.embeddings?.length,
        model: embeddingResult.model,
      });

      if (
        !embeddingResult.embeddings ||
        embeddingResult.embeddings.length === 0
      ) {
        throw new Error("Embedding service returned empty embeddings");
      }

      this.logger.debug("Querying Pinecone index", {
        operation: "vectorSearch",
        topK,
        hasMetadata: true,
        hasFilter: !!filter,
      });

      const index = this.pc.index(this.indexName);
      const queryOptions: any = {
        vector: embeddingResult.embeddings,
        topK,
        includeMetadata: true,
      };
      
      if (filter) {
        queryOptions.filter = filter;
      }
      
      const queryResponse = await index.namespace(namespace).query(queryOptions);

      const results: SearchResult[] = (queryResponse.matches || []).map(
        (match: any) => ({
          id: match.id,
          score: match.score || 0,
          metadata: match.metadata,
        }),
      );

      this.logger.log("Vector search completed successfully", {
        operation: "vectorSearch",
        requestedTopK: topK,
        returnedMatches: results.length,
        namespace,
        avgScore:
          results.length > 0
            ? (
                results.reduce((sum, r) => sum + r.score, 0) / results.length
              ).toFixed(4)
            : 0,
        timestamp: new Date().toISOString(),
      });

      return results;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      this.logger.error("Vector search failed", {
        operation: "vectorSearch",
        queryPreview: query.substring(0, 50),
        topK,
        namespace,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  }
}
