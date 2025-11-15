import { Injectable } from "@nestjs/common";
import { BaseRepository } from "./base.repository";
import { DrizzleService } from "../drizzle.service";
import { documentVersions } from "../schema/document-versions";
import { eq } from "drizzle-orm";
import { MESSAGES } from "../../../common/constants/string-const";

@Injectable()
export class DocumentVersionsRepository extends BaseRepository<
  typeof documentVersions.$inferSelect
> {
  constructor(drizzleService: DrizzleService) {
    super(drizzleService);
  }

  async create(data: typeof documentVersions.$inferInsert) {
    this.logger.log("Creating document version", {
      operation: "create",
      documentId: data.documentId,
      version: data.version,
    });

    const result = await this.db
      .insert(documentVersions)
      .values(data)
      .returning();
    return result[0];
  }

  async findById(id: string) {
    return this.findByIdOrThrow(documentVersions, id, MESSAGES.NOT_FOUND);
  }

  async findByDocumentId(documentId: string) {
    return this.db
      .select()
      .from(documentVersions)
      .where(eq(documentVersions.documentId, documentId));
  }

  async getLatestVersion(documentId: string) {
    const versions = await this.db
      .select()
      .from(documentVersions)
      .where(eq(documentVersions.documentId, documentId))
      .orderBy(documentVersions.version);

    return versions[versions.length - 1] || null;
  }
}
