import { Injectable } from "@nestjs/common";
import { BaseRepository } from "./base.repository";
import { groups } from "../schema/groups";
import { userGroups } from "../schema/user-groups";
import { users } from "../schema/users";
import { documentAclGroups } from "../schema/document-acl-groups";
import { eq, and, desc, count as drizzleCount } from "drizzle-orm";
import { MESSAGES } from "../../../common/constants/string-const";

export interface CreateGroupDto {
  orgId: string;
  name: string;
  createdBy: string;
}

export interface UpdateGroupDto {
  name?: string;
}

export interface GroupEntity {
  id: string;
  orgId: string;
  name: string;
  createdBy: string | null;
  createdAt: Date;
}

export interface GroupWithMemberCount extends GroupEntity {
  memberCount: number;
}

export interface GroupMember {
  userId: string;
  email: string | null;
  joinedAt: Date;
}

export interface GroupWithMembers extends GroupEntity {
  members: GroupMember[];
}

@Injectable()
export class GroupsRepository extends BaseRepository<GroupEntity> {
  //#region ==================== CRUD OPERATIONS ====================

  async create(groupData: CreateGroupDto): Promise<GroupEntity> {
    this.logger.log(
      `Creating group: ${groupData.name} in org: ${groupData.orgId}`,
    );

    try {
      const result = await this.db
        .insert(groups)
        .values({
          orgId: groupData.orgId,
          name: groupData.name,
          createdBy: groupData.createdBy,
        })
        .returning();

      this.logger.log(
        `Group created successfully: ${groupData.name} (ID: ${result[0].id})`,
      );
      return result[0] as GroupEntity;
    } catch (error) {
      const errorStack = error instanceof Error ? error.stack : "";
      this.logger.error(
        `Failed to create group: ${groupData.name}`,
        errorStack,
      );
      throw error;
    }
  }

  async findById(id: string): Promise<GroupEntity | null> {
    this.logger.log(`Finding group by ID: ${id}`);
    const result = await this.findOne(groups, eq(groups.id, id));
    if (result) {
      this.logger.log(`Group found: ${result.name} (ID: ${id})`);
    } else {
      this.logger.log(`Group not found with ID: ${id}`);
    }
    return result;
  }

  async findByIdOrThrow(id: string): Promise<GroupEntity> {
    return super.findByIdOrThrow(
      groups,
      id,
      MESSAGES.GROUP_NOT_FOUND || "Group not found",
    );
  }

  async findAll(): Promise<GroupEntity[]> {
    this.logger.log("Finding all groups");

    try {
      const groupList = await this.db
        .select()
        .from(groups)
        .orderBy(desc(groups.createdAt));

      this.logger.log(`Found ${groupList.length} groups`);
      return groupList;
    } catch (error) {
      const errorStack = error instanceof Error ? error.stack : "";
      this.logger.error("Failed to find all groups", errorStack);
      throw error;
    }
  }

  async update(id: string, groupData: UpdateGroupDto): Promise<GroupEntity> {
    this.logger.log(`Updating group: ${id}`);

    try {
      const updateData: any = {};

      if (groupData.name !== undefined) {
        updateData.name = groupData.name;
      }

      const result = await this.db
        .update(groups)
        .set(updateData)
        .where(eq(groups.id, id))
        .returning();

      if (!result.length) {
        this.logger.warn(`Group not found for update: ${id}`);
        throw new Error(MESSAGES.GROUP_NOT_FOUND || "Group not found");
      }

      this.logger.log(`Group updated successfully: ${id}`);
      return result[0] as GroupEntity;
    } catch (error) {
      const errorStack = error instanceof Error ? error.stack : "";
      this.logger.error(`Failed to update group: ${id}`, errorStack);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    this.logger.log(`Deleting group: ${id}`);

    try {
      const result = await this.db
        .delete(groups)
        .where(eq(groups.id, id))
        .returning();

      if (!result.length) {
        this.logger.warn(`Group not found for deletion: ${id}`);
        throw new Error(MESSAGES.GROUP_NOT_FOUND || "Group not found");
      }

      this.logger.log(`Group deleted successfully: ${id}`);
    } catch (error) {
      const errorStack = error instanceof Error ? error.stack : "";
      this.logger.error(`Failed to delete group: ${id}`, errorStack);
      throw error;
    }
  }

  //#endregion

  //#region ==================== ORGANIZATION OPERATIONS ====================

  /**
   * Find groups by organization with member count
   */
  async findByOrganization(orgId: string): Promise<GroupWithMemberCount[]> {
    this.logger.log(`Finding groups for organization: ${orgId}`);

    try {
      const groupList = await this.db
        .select({
          id: groups.id,
          orgId: groups.orgId,
          name: groups.name,
          createdBy: groups.createdBy,
          createdAt: groups.createdAt,
          memberCount: drizzleCount(userGroups.userId),
        })
        .from(groups)
        .leftJoin(userGroups, eq(groups.id, userGroups.groupId))
        .where(eq(groups.orgId, orgId))
        .groupBy(groups.id)
        .orderBy(desc(groups.createdAt));

      this.logger.log(
        `Found ${groupList.length} groups for organization: ${orgId}`,
      );

      return groupList;
    } catch (error) {
      const errorStack = error instanceof Error ? error.stack : "";
      this.logger.error(
        `Failed to find groups for organization: ${orgId}`,
        errorStack,
      );
      throw error;
    }
  }

  //#endregion

  //#region ==================== MEMBER OPERATIONS ====================

  /**
   * Find group with members
   */
  async findWithMembers(id: string): Promise<GroupWithMembers | null> {
    this.logger.log(`Finding group with members: ${id}`);

    try {
      // Get group
      const group = await this.findById(id);
      if (!group) {
        this.logger.log(`Group not found: ${id}`);
        return null;
      }

      // Get members
      const members = await this.getMembers(id);

      this.logger.log(`Found group with ${members.length} members: ${id}`);

      return {
        ...group,
        members,
      };
    } catch (error) {
      const errorStack = error instanceof Error ? error.stack : "";
      this.logger.error(`Failed to find group with members: ${id}`, errorStack);
      throw error;
    }
  }

  /**
   * Get group members
   */
  async getMembers(groupId: string): Promise<GroupMember[]> {
    this.logger.log(`Getting members for group: ${groupId}`);

    try {
      const membersWithJoinedAt = await this.db
        .select({
          userId: users.id,
          email: users.email,
          joinedAt: users.createdAt,
        })
        .from(userGroups)
        .innerJoin(users, eq(userGroups.userId, users.id))
        .where(eq(userGroups.groupId, groupId));

      this.logger.log(
        `Found ${membersWithJoinedAt.length} members for group: ${groupId}`,
      );

      return membersWithJoinedAt;
    } catch (error) {
      const errorStack = error instanceof Error ? error.stack : "";
      this.logger.error(
        `Failed to get members for group: ${groupId}`,
        errorStack,
      );
      throw error;
    }
  }

  /**
   * Add member to group
   */
  async addMember(groupId: string, userId: string): Promise<void> {
    this.logger.log(`Adding member ${userId} to group ${groupId}`);

    try {
      await this.db.insert(userGroups).values({
        userId,
        groupId,
      });

      this.logger.log(
        `Member ${userId} added to group ${groupId} successfully`,
      );
    } catch (error) {
      const errorStack = error instanceof Error ? error.stack : "";
      this.logger.error(
        `Failed to add member ${userId} to group ${groupId}`,
        errorStack,
      );
      throw error;
    }
  }

  /**
   * Remove member from group
   */
  async removeMember(groupId: string, userId: string): Promise<void> {
    this.logger.log(`Removing member ${userId} from group ${groupId}`);

    try {
      await this.db
        .delete(userGroups)
        .where(
          and(eq(userGroups.userId, userId), eq(userGroups.groupId, groupId)),
        );

      this.logger.log(
        `Member ${userId} removed from group ${groupId} successfully`,
      );
    } catch (error) {
      const errorStack = error instanceof Error ? error.stack : "";
      this.logger.error(
        `Failed to remove member ${userId} from group ${groupId}`,
        errorStack,
      );
      throw error;
    }
  }

  //#endregion

  //#region ==================== USER OPERATIONS ====================

  /**
   * Find groups by user (for ACL queries)
   */
  async findByUser(userId: string): Promise<GroupEntity[]> {
    this.logger.log(`Finding groups for user: ${userId}`);

    try {
      const groupList = await this.db
        .select({
          id: groups.id,
          orgId: groups.orgId,
          name: groups.name,
          createdBy: groups.createdBy,
          createdAt: groups.createdAt,
        })
        .from(groups)
        .innerJoin(userGroups, eq(groups.id, userGroups.groupId))
        .where(eq(userGroups.userId, userId))
        .orderBy(desc(groups.createdAt));

      this.logger.log(`Found ${groupList.length} groups for user: ${userId}`);

      return groupList;
    } catch (error) {
      const errorStack = error instanceof Error ? error.stack : "";
      this.logger.error(
        `Failed to find groups for user: ${userId}`,
        errorStack,
      );
      throw error;
    }
  }

  //#endregion

  //#region ==================== UTILITY OPERATIONS ====================

  /**
   * Check if group name exists in organization
   */
  async nameExistsInOrg(orgId: string, name: string): Promise<boolean> {
    this.logger.log(`Checking if group name exists in org ${orgId}: ${name}`);
    const exists = await this.exists(
      groups,
      and(eq(groups.orgId, orgId), eq(groups.name, name)),
    );
    this.logger.log(
      `Group name exists check for ${name} in org ${orgId}: ${exists}`,
    );
    return exists;
  }

  /**
   * Check if group has document ACLs
   */
  async hasDocumentAcls(groupId: string): Promise<boolean> {
    this.logger.log(`Checking if group has document ACLs: ${groupId}`);
    const exists = await this.exists(
      documentAclGroups,
      eq(documentAclGroups.groupId, groupId),
    );
    this.logger.log(`Group has document ACLs: ${exists}`);
    return exists;
  }

  /**
   * Get member count for group
   */
  async getMemberCount(groupId: string): Promise<number> {
    this.logger.log(`Counting members for group: ${groupId}`);
    return this.count(userGroups, eq(userGroups.groupId, groupId));
  }

  /**
   * Get total groups count
   */
  async getGroupsCount(): Promise<number> {
    this.logger.log("Counting total groups");
    return this.count(groups);
  }

  //#endregion
}
