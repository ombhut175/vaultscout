import { Injectable } from "@nestjs/common";
import { BaseRepository } from "./base.repository";
import { embeddings } from "../schema/embeddings";
import { eq } from "drizzle-orm";
import { MESSAGES } from "../../../common/constants/string-const";

@Injectable()
export class EmbeddingsRepository extends BaseRepository<
  typeof embeddings.$inferSelect
> {
  async create(data: typeof embeddings.$inferInsert) {
    const result = await this.db.insert(embeddings).values(data).returning();
    return result[0];
  }

  async createMany(data: (typeof embeddings.$inferInsert)[]) {
    this.logger.log("Creating multiple embeddings", {
      operation: "createMany",
      count: data.length,
    });

    const result = await this.db.insert(embeddings).values(data).returning();
    return result;
  }

  async findById(id: string) {
    return this.findByIdOrThrow(embeddings, id, MESSAGES.NOT_FOUND);
  }

  async findByChunkId(chunkId: string) {
    return this.db
      .select()
      .from(embeddings)
      .where(eq(embeddings.chunkId, chunkId));
  }

  async findByOrgId(orgId: string) {
    return this.db.select().from(embeddings).where(eq(embeddings.orgId, orgId));
  }
}
