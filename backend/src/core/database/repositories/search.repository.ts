import { Injectable } from "@nestjs/common";
import { BaseRepository } from "./base.repository";
import { searchLogs } from "../schema/search-logs";
import { userGroups } from "../schema/user-groups";
import { documentAclGroups } from "../schema/document-acl-groups";
import { documents } from "../schema/documents";
import { eq, and, desc, inArray, count } from "drizzle-orm";

export interface SearchLogEntity {
  id: string;
  orgId: string;
  userId: string | null;
  queryText: string;
  filters: Record<string, any>;
  topk: number;
  latencyMs: number | null;
  matchIds: string[];
  createdAt: Date;
}

export interface CreateSearchLogDto {
  orgId: string;
  userId: string;
  queryText: string;
  filters?: Record<string, any>;
  topk?: number;
  latencyMs?: number;
  matchIds?: string[];
}

@Injectable()
export class SearchRepository extends BaseRepository<SearchLogEntity> {
  //#region ==================== ACL OPERATIONS ====================

  /**
   * Get all group IDs that a user belongs to
   */
  async getUserAccessibleGroupIds(userId: string): Promise<string[]> {
    this.logger.log(`Getting accessible group IDs for user: ${userId}`);

    try {
      const groups = await this.db
        .select({ groupId: userGroups.groupId })
        .from(userGroups)
        .where(eq(userGroups.userId, userId));

      const groupIds = groups.map((g) => g.groupId);
      this.logger.log(
        `Found ${groupIds.length} accessible groups for user: ${userId}`,
      );

      return groupIds;
    } catch (error) {
      const errorStack = error instanceof Error ? error.stack : "";
      this.logger.error(
        `Failed to get accessible group IDs for user: ${userId}`,
        errorStack,
      );
      throw error;
    }
  }

  /**
   * Get all document IDs accessible to specific groups
   */
  async getDocumentsByGroupIds(
    groupIds: string[],
    orgId: string,
  ): Promise<string[]> {
    this.logger.log(
      `Getting documents for ${groupIds.length} groups in org: ${orgId}`,
    );

    try {
      if (groupIds.length === 0) {
        this.logger.log("No groups provided, returning empty document list");
        return [];
      }

      const docs = await this.db
        .selectDistinct({ documentId: documentAclGroups.documentId })
        .from(documentAclGroups)
        .innerJoin(documents, eq(documentAclGroups.documentId, documents.id))
        .where(
          and(
            inArray(documentAclGroups.groupId, groupIds),
            eq(documents.orgId, orgId),
            eq(documents.status, "ready"),
          ),
        );

      const documentIds = docs.map((d) => d.documentId);
      this.logger.log(
        `Found ${documentIds.length} accessible documents for groups in org: ${orgId}`,
      );

      return documentIds;
    } catch (error) {
      const errorStack = error instanceof Error ? error.stack : "";
      this.logger.error(
        `Failed to get documents for groups in org: ${orgId}`,
        errorStack,
      );
      throw error;
    }
  }

  //#endregion

  //#region ==================== SEARCH LOG OPERATIONS ====================

  /**
   * Log a search query
   */
  async logSearch(logData: CreateSearchLogDto): Promise<SearchLogEntity> {
    this.logger.log(
      `Logging search query for user ${logData.userId} in org ${logData.orgId}`,
    );

    try {
      const result = await this.db
        .insert(searchLogs)
        .values({
          orgId: logData.orgId,
          userId: logData.userId,
          queryText: logData.queryText,
          filters: logData.filters || {},
          topk: logData.topk || 10,
          latencyMs: logData.latencyMs || null,
          matchIds: logData.matchIds || [],
        })
        .returning();

      this.logger.log(`Search query logged successfully: ${result[0].id}`);
      return result[0] as SearchLogEntity;
    } catch (error) {
      const errorStack = error instanceof Error ? error.stack : "";
      this.logger.error(
        `Failed to log search query for user ${logData.userId}`,
        errorStack,
      );
      throw error;
    }
  }

  /**
   * Get search history for a user with pagination
   */
  async getSearchHistory(
    userId: string,
    orgId: string,
    page = 1,
    limit = 20,
  ): Promise<{ logs: SearchLogEntity[]; total: number }> {
    this.logger.log(
      `Getting search history for user ${userId} in org ${orgId} (page: ${page}, limit: ${limit})`,
    );

    try {
      const offset = (page - 1) * limit;

      // Get search logs with pagination
      const logs = await this.db
        .select()
        .from(searchLogs)
        .where(and(eq(searchLogs.userId, userId), eq(searchLogs.orgId, orgId)))
        .orderBy(desc(searchLogs.createdAt))
        .limit(limit)
        .offset(offset);

      const [{ count: total }] = await this.db
        .select({ count: count() })
        .from(searchLogs)
        .where(and(eq(searchLogs.userId, userId), eq(searchLogs.orgId, orgId)));

      this.logger.log(
        `Found ${logs.length} search logs (total: ${total}) for user ${userId}`,
      );

      return {
        logs: logs as SearchLogEntity[],
        total,
      };
    } catch (error) {
      const errorStack = error instanceof Error ? error.stack : "";
      this.logger.error(
        `Failed to get search history for user ${userId}`,
        errorStack,
      );
      throw error;
    }
  }

  /**
   * Clear all search history for a user in an organization
   */
  async clearSearchHistory(userId: string, orgId: string): Promise<number> {
    this.logger.log(
      `Clearing search history for user ${userId} in org ${orgId}`,
    );

    try {
      const result = await this.db
        .delete(searchLogs)
        .where(and(eq(searchLogs.userId, userId), eq(searchLogs.orgId, orgId)))
        .returning({ id: searchLogs.id });

      const deletedCount = result.length;
      this.logger.log(
        `Cleared ${deletedCount} search logs for user ${userId} in org ${orgId}`,
      );

      return deletedCount;
    } catch (error) {
      const errorStack = error instanceof Error ? error.stack : "";
      this.logger.error(
        `Failed to clear search history for user ${userId} in org ${orgId}`,
        errorStack,
      );
      throw error;
    }
  }

  //#endregion
}
