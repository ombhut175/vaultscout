import { Injectable } from "@nestjs/common";
import { BaseRepository } from "./base.repository";
import { documents } from "../schema/documents";
import { documentAclGroups } from "../schema/document-acl-groups";
import { userGroups } from "../schema/user-groups";
import { chunks } from "../schema/chunks";
import { embeddings } from "../schema/embeddings";
import { documentVersions } from "../schema/document-versions";
import { users } from "../schema/users";
import { eq, and, inArray, desc, count } from "drizzle-orm";
import { MESSAGES } from "../../../common/constants/string-const";

@Injectable()
export class DocumentsRepository extends BaseRepository<
  typeof documents.$inferSelect
> {
  async create(data: typeof documents.$inferInsert) {
    this.logger.log("Creating document", {
      operation: "create",
      orgId: data.orgId,
      title: data.title,
    });

    const result = await this.db.insert(documents).values(data).returning();
    return result[0];
  }

  async findById(id: string) {
    return this.findByIdOrThrow(documents, id, MESSAGES.DOCUMENT_NOT_FOUND);
  }

  async findByOrgId(orgId: string) {
    return this.db.select().from(documents).where(eq(documents.orgId, orgId));
  }

  async updateStatus(id: string, status: string) {
    this.logger.log("Updating document status", {
      operation: "updateStatus",
      documentId: id,
      status,
    });

    const result = await this.db
      .update(documents)
      .set({ status, updatedAt: new Date() })
      .where(eq(documents.id, id))
      .returning();

    return result[0];
  }

  async update(id: string, data: Partial<typeof documents.$inferInsert>) {
    this.logger.log("Updating document", {
      operation: "update",
      documentId: id,
      fields: Object.keys(data),
    });

    const result = await this.db
      .update(documents)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(documents.id, id))
      .returning();

    return result[0];
  }

  async delete(id: string) {
    this.logger.log("Deleting document", {
      operation: "delete",
      documentId: id,
    });

    await this.db.delete(documents).where(eq(documents.id, id));
  }

  //#region ACL and Filtering Methods

  /**
   * Find documents by organization with optional ACL filtering
   * @param orgId Organization ID
   * @param page Page number (1-indexed)
   * @param limit Items per page
   * @param filters Optional filters (status, fileType, tags)
   */
  async findByOrganization(
    orgId: string,
    page = 1,
    limit = 20,
    filters?: {
      status?: string;
      fileType?: string;
      tags?: string[];
    },
  ) {
    this.logger.log("Finding documents by organization", {
      operation: "findByOrganization",
      orgId,
      page,
      limit,
      filters,
    });

    const offset = (page - 1) * limit;

    // Build where conditions
    const conditions = [eq(documents.orgId, orgId)];
    if (filters?.status) {
      conditions.push(eq(documents.status, filters.status));
    }
    if (filters?.fileType) {
      conditions.push(eq(documents.fileType, filters.fileType));
    }

    // Query documents with creator info
    const query = this.db
      .select({
        id: documents.id,
        orgId: documents.orgId,
        createdBy: documents.createdBy,
        createdByEmail: users.email,
        title: documents.title,
        fileType: documents.fileType,
        tags: documents.tags,
        status: documents.status,
        contentHash: documents.contentHash,
        createdAt: documents.createdAt,
        updatedAt: documents.updatedAt,
      })
      .from(documents)
      .leftJoin(users, eq(documents.createdBy, users.id))
      .where(and(...conditions))
      .orderBy(desc(documents.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count
    const countQuery = this.db
      .select({ count: count() })
      .from(documents)
      .where(and(...conditions));

    const [docs, totalResult] = await Promise.all([query, countQuery]);

    return {
      documents: docs,
      total: totalResult[0]?.count || 0,
      page,
      limit,
      totalPages: Math.ceil((totalResult[0]?.count || 0) / limit),
    };
  }

  /**
   * Find documents accessible to a specific user based on their group memberships
   * @param userId User ID
   * @param orgId Organization ID
   * @param page Page number (1-indexed)
   * @param limit Items per page
   * @param filters Optional filters
   */
  async findAccessibleToUser(
    userId: string,
    orgId: string,
    page = 1,
    limit = 20,
    filters?: {
      status?: string;
      fileType?: string;
      tags?: string[];
    },
  ) {
    this.logger.log("Finding documents accessible to user", {
      operation: "findAccessibleToUser",
      userId,
      orgId,
      page,
      limit,
      filters,
    });

    const offset = (page - 1) * limit;

    // First, get user's group IDs
    const userGroupIds = await this.db
      .select({ groupId: userGroups.groupId })
      .from(userGroups)
      .where(eq(userGroups.userId, userId));

    const groupIds = userGroupIds.map((ug) => ug.groupId);

    if (groupIds.length === 0) {
      // User has no groups, return empty result
      return {
        documents: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
      };
    }

    // Build where conditions
    const conditions = [
      eq(documents.orgId, orgId),
      inArray(documentAclGroups.groupId, groupIds),
    ];
    if (filters?.status) {
      conditions.push(eq(documents.status, filters.status));
    }
    if (filters?.fileType) {
      conditions.push(eq(documents.fileType, filters.fileType));
    }

    // Query documents with ACL filtering
    const query = this.db
      .selectDistinct({
        id: documents.id,
        orgId: documents.orgId,
        createdBy: documents.createdBy,
        createdByEmail: users.email,
        title: documents.title,
        fileType: documents.fileType,
        tags: documents.tags,
        status: documents.status,
        contentHash: documents.contentHash,
        createdAt: documents.createdAt,
        updatedAt: documents.updatedAt,
      })
      .from(documents)
      .innerJoin(
        documentAclGroups,
        eq(documents.id, documentAclGroups.documentId),
      )
      .leftJoin(users, eq(documents.createdBy, users.id))
      .where(and(...conditions))
      .orderBy(desc(documents.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count
    const countQuery = this.db
      .selectDistinct({ id: documents.id })
      .from(documents)
      .innerJoin(
        documentAclGroups,
        eq(documents.id, documentAclGroups.documentId),
      )
      .where(and(...conditions));

    const [docs, countResult] = await Promise.all([query, countQuery]);

    return {
      documents: docs,
      total: countResult.length,
      page,
      limit,
      totalPages: Math.ceil(countResult.length / limit),
    };
  }

  //#endregion

  //#region Document Details with Relations

  /**
   * Find document with its chunks and embeddings
   * @param documentId Document ID
   */
  async findWithChunks(documentId: string) {
    this.logger.log("Finding document with chunks", {
      operation: "findWithChunks",
      documentId,
    });

    const document = await this.findById(documentId);

    const chunksWithEmbeddings = await this.db
      .select({
        id: chunks.id,
        position: chunks.position,
        sectionTitle: chunks.sectionTitle,
        page: chunks.page,
        text: chunks.text,
        tokenCount: chunks.tokenCount,
        contentHash: chunks.contentHash,
        createdAt: chunks.createdAt,
        embeddingId: embeddings.id,
        vectorId: embeddings.vectorId,
        namespace: embeddings.namespace,
      })
      .from(chunks)
      .leftJoin(embeddings, eq(chunks.id, embeddings.chunkId))
      .where(eq(chunks.documentId, documentId))
      .orderBy(chunks.position);

    return {
      ...document,
      chunks: chunksWithEmbeddings,
    };
  }

  /**
   * Find document with its versions
   * @param documentId Document ID
   */
  async findWithVersions(documentId: string) {
    this.logger.log("Finding document with versions", {
      operation: "findWithVersions",
      documentId,
    });

    const document = await this.findById(documentId);

    const versions = await this.db
      .select()
      .from(documentVersions)
      .where(eq(documentVersions.documentId, documentId))
      .orderBy(desc(documentVersions.version));

    return {
      ...document,
      versions,
    };
  }

  //#endregion

  //#region Update and Delete Operations

  /**
   * Update document metadata (title, tags)
   * @param id Document ID
   * @param metadata Metadata to update
   */
  async updateMetadata(
    id: string,
    metadata: { title?: string; tags?: string[] },
  ) {
    this.logger.log("Updating document metadata", {
      operation: "updateMetadata",
      documentId: id,
      metadata,
    });

    const result = await this.db
      .update(documents)
      .set({ ...metadata, updatedAt: new Date() })
      .where(eq(documents.id, id))
      .returning();

    return result[0];
  }

  /**
   * Delete document with cascade (chunks, embeddings)
   * Note: Pinecone vector deletion should be handled by the service layer
   * @param id Document ID
   */
  async deleteWithCascade(id: string) {
    this.logger.log("Deleting document with cascade", {
      operation: "deleteWithCascade",
      documentId: id,
    });

    // Get all vector IDs before deletion for Pinecone cleanup
    const vectorIds = await this.db
      .select({
        vectorId: embeddings.vectorId,
        namespace: embeddings.namespace,
      })
      .from(embeddings)
      .innerJoin(chunks, eq(embeddings.chunkId, chunks.id))
      .where(eq(chunks.documentId, id));

    // Delete document (cascade will handle chunks and embeddings)
    await this.db.delete(documents).where(eq(documents.id, id));

    return { vectorIds };
  }

  //#endregion

  //#region ACL Management

  /**
   * Get ACL groups for a document
   * @param documentId Document ID
   */
  async getAclGroups(documentId: string) {
    this.logger.log("Getting ACL groups for document", {
      operation: "getAclGroups",
      documentId,
    });

    return this.db
      .select({ groupId: documentAclGroups.groupId })
      .from(documentAclGroups)
      .where(eq(documentAclGroups.documentId, documentId));
  }

  /**
   * Set ACL groups for a document (replaces existing)
   * @param documentId Document ID
   * @param groupIds Group IDs to set
   */
  async setAclGroups(documentId: string, groupIds: string[]) {
    this.logger.log("Setting ACL groups for document", {
      operation: "setAclGroups",
      documentId,
      groupIds,
    });

    // Delete existing ACL entries
    await this.db
      .delete(documentAclGroups)
      .where(eq(documentAclGroups.documentId, documentId));

    // Insert new ACL entries
    if (groupIds.length > 0) {
      await this.db.insert(documentAclGroups).values(
        groupIds.map((groupId) => ({
          documentId,
          groupId,
        })),
      );
    }
  }

  /**
   * Check if user has access to document based on group membership
   * @param documentId Document ID
   * @param userId User ID
   */
  async checkUserAccess(documentId: string, userId: string): Promise<boolean> {
    this.logger.log("Checking user access to document", {
      operation: "checkUserAccess",
      documentId,
      userId,
    });

    const result = await this.db
      .select({ count: count() })
      .from(documentAclGroups)
      .innerJoin(userGroups, eq(documentAclGroups.groupId, userGroups.groupId))
      .where(
        and(
          eq(documentAclGroups.documentId, documentId),
          eq(userGroups.userId, userId),
        ),
      );

    return (result[0]?.count || 0) > 0;
  }

  //#endregion
}
