import { Injectable } from "@nestjs/common";
import { BaseRepository } from "./base.repository";
import { DrizzleService } from "../drizzle.service";
import { documentAclGroups } from "../schema/document-acl-groups";
import { eq, and } from "drizzle-orm";

@Injectable()
export class DocumentAclGroupsRepository extends BaseRepository<
  typeof documentAclGroups.$inferSelect
> {
  constructor(drizzleService: DrizzleService) {
    super(drizzleService);
  }

  async addGroupsToDocument(documentId: string, groupIds: string[]) {
    if (groupIds.length === 0) return [];

    this.logger.log("Adding ACL groups to document", {
      operation: "addGroupsToDocument",
      documentId,
      groupCount: groupIds.length,
    });

    const values = groupIds.map((groupId) => ({
      documentId,
      groupId,
    }));

    const result = await this.db
      .insert(documentAclGroups)
      .values(values)
      .returning();

    return result;
  }

  async removeGroupFromDocument(documentId: string, groupId: string) {
    this.logger.log("Removing ACL group from document", {
      operation: "removeGroupFromDocument",
      documentId,
      groupId,
    });

    await this.db
      .delete(documentAclGroups)
      .where(
        and(
          eq(documentAclGroups.documentId, documentId),
          eq(documentAclGroups.groupId, groupId),
        ),
      );
  }

  async removeAllGroupsFromDocument(documentId: string) {
    this.logger.log("Removing all ACL groups from document", {
      operation: "removeAllGroupsFromDocument",
      documentId,
    });

    await this.db
      .delete(documentAclGroups)
      .where(eq(documentAclGroups.documentId, documentId));
  }

  async getGroupsForDocument(documentId: string) {
    return this.db
      .select()
      .from(documentAclGroups)
      .where(eq(documentAclGroups.documentId, documentId));
  }
}
