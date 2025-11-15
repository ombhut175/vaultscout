import { Injectable } from "@nestjs/common";
import { BaseRepository } from "./base.repository";
import { DrizzleService } from "../drizzle.service";
import { files } from "../schema/files";
import { eq } from "drizzle-orm";
import { MESSAGES } from "../../../common/constants/string-const";

@Injectable()
export class FilesRepository extends BaseRepository<typeof files.$inferSelect> {
  constructor(drizzleService: DrizzleService) {
    super(drizzleService);
  }

  async create(data: typeof files.$inferInsert) {
    this.logger.log("Creating file record", {
      operation: "create",
      bucket: data.bucket,
      path: data.path,
    });

    const result = await this.db.insert(files).values(data).returning();
    return result[0];
  }

  async findById(id: string) {
    return this.findByIdOrThrow(files, id, MESSAGES.NOT_FOUND);
  }

  async findByVersionId(versionId: string) {
    return this.db.select().from(files).where(eq(files.versionId, versionId));
  }

  async findByDocumentId(documentId: string) {
    return this.db.select().from(files).where(eq(files.documentId, documentId));
  }
}
