import { Injectable } from "@nestjs/common";
import { BaseRepository } from "./base.repository";
import { chunks } from "../schema/chunks";
import { eq } from "drizzle-orm";
import { MESSAGES } from "../../../common/constants/string-const";

@Injectable()
export class ChunksRepository extends BaseRepository<
  typeof chunks.$inferSelect
> {
  async create(data: typeof chunks.$inferInsert) {
    const result = await this.db.insert(chunks).values(data).returning();
    return result[0];
  }

  async createMany(data: (typeof chunks.$inferInsert)[]) {
    this.logger.log("Creating multiple chunks", {
      operation: "createMany",
      count: data.length,
    });

    const result = await this.db.insert(chunks).values(data).returning();
    return result;
  }

  async findById(id: string) {
    return this.findByIdOrThrow(chunks, id, MESSAGES.NOT_FOUND);
  }

  async findByDocumentId(documentId: string, limit?: number, offset?: number) {
    const query = this.db
      .select()
      .from(chunks)
      .where(eq(chunks.documentId, documentId))
      .orderBy(chunks.position);

    if (limit !== undefined) {
      query.limit(limit);
    }
    if (offset !== undefined) {
      query.offset(offset);
    }

    return query;
  }

  async countByDocumentId(documentId: string): Promise<number> {
    const result = await this.db
      .select({ count: chunks.id })
      .from(chunks)
      .where(eq(chunks.documentId, documentId));

    return result.length;
  }

  async findByVersionId(versionId: string) {
    return this.db.select().from(chunks).where(eq(chunks.versionId, versionId));
  }

  async deleteByVersionId(versionId: string) {
    this.logger.log("Deleting chunks by version", {
      operation: "deleteByVersionId",
      versionId,
    });

    await this.db.delete(chunks).where(eq(chunks.versionId, versionId));
  }
}
