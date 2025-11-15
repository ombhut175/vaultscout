import { Injectable } from "@nestjs/common";
import { BaseRepository } from "./base.repository";
import { DrizzleService } from "../drizzle.service";
import { documents } from "../schema/documents";
import { eq } from "drizzle-orm";
import { MESSAGES } from "../../../common/constants/string-const";

@Injectable()
export class DocumentsRepository extends BaseRepository<
  typeof documents.$inferSelect
> {
  constructor(drizzleService: DrizzleService) {
    super(drizzleService);
  }

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
}
