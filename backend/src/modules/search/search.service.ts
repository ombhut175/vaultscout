import { Injectable, Logger } from "@nestjs/common";
import { SearchRepository } from "../../core/database/repositories/search.repository";
import { DocumentsRepository } from "../../core/database/repositories/documents.repository";
import { ChunksRepository } from "../../core/database/repositories/chunks.repository";
import { SearchService as PineconeSearchService } from "../pinecone/services/search.service";
import { SearchQueryDto } from "./dto";

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);

  constructor(
    private readonly searchRepository: SearchRepository,
    private readonly documentsRepository: DocumentsRepository,
    private readonly chunksRepository: ChunksRepository,
    private readonly pineconeSearchService: PineconeSearchService,
  ) {}

  //#region Semantic Search

  /**
   * Perform semantic search filtered by user's created documents
   * @param userId User ID
   * @param searchQuery Search query parameters
   */
  async semanticSearch(userId: string, searchQuery: SearchQueryDto) {
    const startTime = Date.now();
    const { query, topK = 10, fileType, tags, orgId } = searchQuery;

    this.logger.log("Starting semantic search", {
      operation: "semanticSearch",
      userId,
      orgId,
      query: query.substring(0, 50),
      topK,
      filters: { fileType, tags },
    });

    try {
      const pineconeFilter: Record<string, any> = {};

      if (fileType) {
        pineconeFilter.fileType = fileType;
      }

      if (tags && tags.length > 0) {
        pineconeFilter.tags = { $in: tags };
      }

      this.logger.log("Executing Pinecone search", {
        operation: "semanticSearch",
        filter: pineconeFilter,
      });

      const vectorResults = await this.pineconeSearchService.vectorSearch({
        query,
        topK: topK * 2,
        filter: Object.keys(pineconeFilter).length > 0 ? pineconeFilter : undefined,
        namespace: orgId || "",
      });

      this.logger.log("Pinecone search completed", {
        operation: "semanticSearch",
        resultCount: vectorResults.length,
      });

      const enrichedResults = await Promise.all(
        vectorResults.map(async (result) => {
          const metadata = result.metadata || {};
          const chunkId = metadata.chunk_id as string;
          const documentId = metadata.document_id as string;

          try {
            const chunk = await this.chunksRepository.findById(chunkId);
            const document = await this.documentsRepository.findById(documentId);

            if (document.createdBy !== userId) {
              return null;
            }

            return {
              id: chunkId,
              chunkId,
              documentId,
              documentTitle: document.title,
              text: chunk.text,
              sectionTitle: chunk.sectionTitle,
              page: chunk.page,
              position: chunk.position,
              score: result.score,
              fileType: document.fileType,
              tags: document.tags,
            };
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : String(error);
            this.logger.error("Failed to enrich search result", {
              operation: "semanticSearch",
              chunkId,
              documentId,
              error: errorMessage,
            });
            return null;
          }
        }),
      );

      const validResults = enrichedResults
        .filter((r) => r !== null)
        .slice(0, topK);

      const latencyMs = Date.now() - startTime;

      const matchIds = validResults.map((r) => r.chunkId);
      await this.logSearch(userId, orgId || null, query, topK, matchIds, latencyMs, {
        fileType,
        tags,
      });

      this.logger.log("Semantic search completed", {
        operation: "semanticSearch",
        resultCount: validResults.length,
        latencyMs,
      });

      return {
        results: validResults,
        total: validResults.length,
        query,
        latencyMs,
      };
    } catch (error) {
      const latencyMs = Date.now() - startTime;
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;

      this.logger.error("Semantic search failed", {
        operation: "semanticSearch",
        userId,
        query: query.substring(0, 50),
        error: errorMessage,
        stack: errorStack,
        latencyMs,
      });

      await this.logSearch(userId, searchQuery.orgId || null, query, topK, [], latencyMs, {
        fileType,
        tags,
      });

      throw error;
    }
  }

  //#endregion

  //#region Search History

  /**
   * Get search history for a user
   * @param userId User ID
   * @param orgId Organization ID (optional)
   * @param page Page number
   * @param limit Items per page
   */
  async getSearchHistory(userId: string, orgId?: string | null, page = 1, limit = 20) {
    this.logger.log("Getting search history", {
      operation: "getSearchHistory",
      userId,
      orgId,
      page,
      limit,
    });

    const { logs, total } = await this.searchRepository.getSearchHistory(
      userId,
      orgId,
      page,
      limit,
    );

    const history = logs.map((log) => ({
      id: log.id,
      queryText: log.queryText,
      filters: log.filters,
      topk: log.topk,
      latencyMs: log.latencyMs || 0,
      matchIds: log.matchIds || [],
      createdAt: log.createdAt,
    }));

    this.logger.log("Search history retrieved", {
      operation: "getSearchHistory",
      count: history.length,
      total,
    });

    return {
      history,
      total,
    };
  }

  //#endregion

  //#region Search Suggestions

  /**
   * Get search suggestions based on user's search history
   * @param userId User ID
   * @param orgId Organization ID (optional)
   * @param limit Number of suggestions
   */
  async getSearchSuggestions(userId: string, orgId?: string | null, limit = 10) {
    this.logger.log("Getting search suggestions", {
      operation: "getSearchSuggestions",
      userId,
      orgId,
      limit,
    });

    const { logs } = await this.searchRepository.getSearchHistory(
      userId,
      orgId,
      1,
      100,
    );

    // Group by query text and count occurrences
    const queryMap = new Map<string, { count: number; lastSearched: Date }>();

    logs.forEach((log) => {
      const existing = queryMap.get(log.queryText);
      if (existing) {
        existing.count++;
        if (log.createdAt > existing.lastSearched) {
          existing.lastSearched = log.createdAt;
        }
      } else {
        queryMap.set(log.queryText, {
          count: 1,
          lastSearched: log.createdAt,
        });
      }
    });

    // Convert to array and sort by count (descending) and lastSearched (descending)
    const suggestions = Array.from(queryMap.entries())
      .map(([query, data]) => ({
        query,
        count: data.count,
        lastSearched: data.lastSearched,
      }))
      .sort((a, b) => {
        if (b.count !== a.count) {
          return b.count - a.count;
        }
        return b.lastSearched.getTime() - a.lastSearched.getTime();
      })
      .slice(0, limit);

    this.logger.log("Search suggestions generated", {
      operation: "getSearchSuggestions",
      count: suggestions.length,
    });

    return {
      suggestions,
    };
  }

  //#endregion

  //#region Clear Search History

  /**
   * Clear all search history for a user
   * @param userId User ID
   * @param orgId Organization ID (optional)
   */
  async clearSearchHistory(userId: string, orgId?: string | null) {
    this.logger.log("Clearing search history", {
      operation: "clearSearchHistory",
      userId,
      orgId,
    });

    const deletedCount = await this.searchRepository.clearSearchHistory(
      userId,
      orgId,
    );

    this.logger.log("Search history cleared", {
      operation: "clearSearchHistory",
      deletedCount,
    });

    return {
      deletedCount,
      message: `Successfully cleared ${deletedCount} search history entries`,
    };
  }

  //#endregion

  //#region Helper Methods

  /**
   * Log a search query
   */
  private async logSearch(
    userId: string,
    orgId: string | null | undefined,
    queryText: string,
    topk: number,
    matchIds: string[],
    latencyMs: number,
    filters?: { fileType?: string; tags?: string[] },
  ) {
    try {
      await this.searchRepository.logSearch({
        userId,
        orgId: orgId || null,
        queryText,
        topk,
        matchIds,
        latencyMs,
        filters: filters || {},
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.error("Failed to log search", {
        operation: "logSearch",
        userId,
        orgId,
        error: errorMessage,
      });
    }
  }

  //#endregion
}
