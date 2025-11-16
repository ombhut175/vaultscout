import { Injectable } from "@nestjs/common";
import { BaseRepository } from "./base.repository";
import { users } from "../schema/users";
import { userOrganizations } from "../schema/user-organizations";
import { userGroups } from "../schema/user-groups";
import { organizations } from "../schema/organizations";
import { groups } from "../schema/groups";
import { eq, and, desc, count } from "drizzle-orm";
import { MESSAGES } from "../../../common/constants/string-const";

export interface CreateUserDto {
  id?: string; // UUID id (optional, will be auto-generated if not provided)
  externalUserId: string; // from your auth provider
  email?: string;
}

export interface UpdateUserDto {
  email?: string;
}

export interface UserEntity {
  id: string; // UUID
  externalUserId: string;
  email: string | null;
  createdAt: Date;
}

export interface UserWithOrganizations extends UserEntity {
  organizations: {
    id: string;
    name: string;
    role: "admin" | "editor" | "viewer";
    joinedAt: Date;
  }[];
}

export interface UserWithGroups extends UserEntity {
  groups: {
    id: string;
    name: string;
    orgId: string;
  }[];
}

@Injectable()
export class UsersRepository extends BaseRepository<UserEntity> {
  //#region ==================== CRUD OPERATIONS ====================

  async create(userData: CreateUserDto): Promise<UserEntity> {
    this.logger.log(
      `Creating user with external ID: ${userData.externalUserId}`,
    );

    try {
      const result = await this.db
        .insert(users)
        .values({
          id: userData.id,
          externalUserId: userData.externalUserId,
          email: userData.email || null,
        })
        .returning();

      this.logger.log(
        `User created successfully: ${userData.externalUserId} (ID: ${result[0].id})`,
      );
      return result[0] as UserEntity;
    } catch (error) {
      const errorStack = error instanceof Error ? error.stack : "";
      this.logger.error(
        `Failed to create user: ${userData.externalUserId}`,
        errorStack,
      );
      throw error;
    }
  }

  async findById(id: string): Promise<UserEntity | null> {
    this.logger.log(`Finding user by ID: ${id}`);
    const result = await this.findOne(users, eq(users.id, id));
    if (result) {
      this.logger.log(`User found: ${result.externalUserId} (ID: ${id})`);
    } else {
      this.logger.log(`User not found with ID: ${id}`);
    }
    return result;
  }

  async findByIdOrThrow(id: string): Promise<UserEntity> {
    return super.findByIdOrThrow(users, id, MESSAGES.USER_NOT_FOUND);
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    this.logger.log(`Finding user by email: ${email}`);
    const result = await this.findOne(users, eq(users.email, email));
    if (result) {
      this.logger.log(`User found with email: ${email} (ID: ${result.id})`);
    } else {
      this.logger.log(`User not found with email: ${email}`);
    }
    return result;
  }

  async findByEmailOrThrow(email: string): Promise<UserEntity> {
    this.logger.log(`Finding user by email (throw if not found): ${email}`);
    return this.findOneOrThrow(
      users,
      eq(users.email, email),
      MESSAGES.USER_NOT_FOUND,
    );
  }

  async findByExternalUserId(
    externalUserId: string,
  ): Promise<UserEntity | null> {
    this.logger.log(`Finding user by external ID: ${externalUserId}`);
    const result = await this.findOne(
      users,
      eq(users.externalUserId, externalUserId),
    );
    if (result) {
      this.logger.log(
        `User found with external ID: ${externalUserId} (ID: ${result.id})`,
      );
    } else {
      this.logger.log(`User not found with external ID: ${externalUserId}`);
    }
    return result;
  }

  async update(id: string, userData: UpdateUserDto): Promise<UserEntity> {
    this.logger.log(`Updating user: ${id}`);

    try {
      const updateData: any = {};

      if (userData.email !== undefined) {
        updateData.email = userData.email;
      }

      const result = await this.db
        .update(users)
        .set(updateData)
        .where(eq(users.id, id))
        .returning();

      if (!result.length) {
        this.logger.warn(`User not found for update: ${id}`);
        throw new Error(MESSAGES.USER_NOT_FOUND);
      }

      this.logger.log(`User updated successfully: ${id}`);
      return result[0] as UserEntity;
    } catch (error) {
      const errorStack = error instanceof Error ? error.stack : "";
      this.logger.error(`Failed to update user: ${id}`, errorStack);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    this.logger.log(`Deleting user: ${id}`);

    try {
      const result = await this.db
        .delete(users)
        .where(eq(users.id, id))
        .returning();

      if (!result.length) {
        this.logger.warn(`User not found for deletion: ${id}`);
        throw new Error(MESSAGES.USER_NOT_FOUND);
      }

      this.logger.log(`User deleted successfully: ${id}`);
    } catch (error) {
      const errorStack = error instanceof Error ? error.stack : "";
      this.logger.error(`Failed to delete user: ${id}`, errorStack);
      throw error;
    }
  }

  //#endregion

  //#region ==================== UTILITY OPERATIONS ====================

  async emailExists(email: string): Promise<boolean> {
    this.logger.log(`Checking if email exists: ${email}`);
    const exists = await this.exists(users, eq(users.email, email));
    this.logger.log(`Email exists check for ${email}: ${exists}`);
    return exists;
  }

  async externalUserIdExists(externalUserId: string): Promise<boolean> {
    this.logger.log(`Checking if external user ID exists: ${externalUserId}`);
    const exists = await this.exists(
      users,
      eq(users.externalUserId, externalUserId),
    );
    this.logger.log(
      `External user ID exists check for ${externalUserId}: ${exists}`,
    );
    return exists;
  }

  async getAllUsers(): Promise<UserEntity[]> {
    this.logger.log("Fetching all users");
    try {
      const userList = await this.db.select().from(users);
      this.logger.log(`Retrieved ${userList.length} users`);
      return userList;
    } catch (error) {
      const errorStack = error instanceof Error ? error.stack : "";
      this.logger.error("Failed to fetch all users", errorStack);
      throw error;
    }
  }

  async getUsersCount(): Promise<number> {
    this.logger.log("Counting total users");
    return this.count(users);
  }

  //#endregion

  //#region ==================== ORGANIZATION OPERATIONS ====================

  /**
   * Find users by organization with role filtering
   */
  async findByOrganization(
    orgId: string,
    role?: "admin" | "editor" | "viewer",
    page = 1,
    limit = 20,
  ): Promise<{ users: UserEntity[]; total: number }> {
    this.logger.log(
      `Finding users for organization: ${orgId}${role ? ` with role: ${role}` : ""}`,
    );

    try {
      const offset = (page - 1) * limit;

      // Build where condition
      const whereConditions = [eq(userOrganizations.orgId, orgId)];
      if (role) {
        whereConditions.push(eq(userOrganizations.role, role));
      }

      // Get users with pagination
      const usersList = await this.db
        .select({
          id: users.id,
          externalUserId: users.externalUserId,
          email: users.email,
          createdAt: users.createdAt,
          role: userOrganizations.role,
          joinedAt: userOrganizations.createdAt,
        })
        .from(users)
        .innerJoin(userOrganizations, eq(users.id, userOrganizations.userId))
        .where(and(...whereConditions))
        .orderBy(desc(userOrganizations.createdAt))
        .limit(limit)
        .offset(offset);

      const totalResult = await this.db
        .select({ count: count() })
        .from(users)
        .innerJoin(userOrganizations, eq(users.id, userOrganizations.userId))
        .where(and(...whereConditions));

      const total = totalResult[0]?.count || 0;

      this.logger.log(
        `Found ${usersList.length} users (total: ${total}) for organization: ${orgId}`,
      );

      return {
        users: usersList.map((u) => ({
          id: u.id,
          externalUserId: u.externalUserId,
          email: u.email,
          createdAt: u.createdAt,
        })),
        total,
      };
    } catch (error) {
      const errorStack = error instanceof Error ? error.stack : "";
      this.logger.error(
        `Failed to find users for organization: ${orgId}`,
        errorStack,
      );
      throw error;
    }
  }

  /**
   * Find user with all their organizations and roles
   */
  async findWithOrganizations(
    userId: string,
  ): Promise<UserWithOrganizations | null> {
    this.logger.log(`Finding user with organizations: ${userId}`);

    try {
      // Get user
      const user = await this.findById(userId);
      if (!user) {
        this.logger.log(`User not found: ${userId}`);
        return null;
      }

      // Get user's organizations
      const userOrgs = await this.db
        .select({
          id: organizations.id,
          name: organizations.name,
          role: userOrganizations.role,
          joinedAt: userOrganizations.createdAt,
        })
        .from(organizations)
        .innerJoin(
          userOrganizations,
          eq(organizations.id, userOrganizations.orgId),
        )
        .where(eq(userOrganizations.userId, userId))
        .orderBy(desc(userOrganizations.createdAt));

      this.logger.log(
        `Found user with ${userOrgs.length} organizations: ${userId}`,
      );

      return {
        ...user,
        organizations: userOrgs,
      };
    } catch (error) {
      const errorStack = error instanceof Error ? error.stack : "";
      this.logger.error(
        `Failed to find user with organizations: ${userId}`,
        errorStack,
      );
      throw error;
    }
  }

  /**
   * Add user to organization with role
   */
  async addToOrganization(
    userId: string,
    orgId: string,
    role: "admin" | "editor" | "viewer",
  ): Promise<void> {
    this.logger.log(
      `Adding user ${userId} to organization ${orgId} with role: ${role}`,
    );

    try {
      await this.db.insert(userOrganizations).values({
        userId,
        orgId,
        role,
      });

      this.logger.log(
        `User ${userId} added to organization ${orgId} successfully`,
      );
    } catch (error) {
      const errorStack = error instanceof Error ? error.stack : "";
      this.logger.error(
        `Failed to add user ${userId} to organization ${orgId}`,
        errorStack,
      );
      throw error;
    }
  }

  /**
   * Remove user from organization
   */
  async removeFromOrganization(userId: string, orgId: string): Promise<void> {
    this.logger.log(`Removing user ${userId} from organization ${orgId}`);

    try {
      await this.db
        .delete(userOrganizations)
        .where(
          and(
            eq(userOrganizations.userId, userId),
            eq(userOrganizations.orgId, orgId),
          ),
        );

      this.logger.log(
        `User ${userId} removed from organization ${orgId} successfully`,
      );
    } catch (error) {
      const errorStack = error instanceof Error ? error.stack : "";
      this.logger.error(
        `Failed to remove user ${userId} from organization ${orgId}`,
        errorStack,
      );
      throw error;
    }
  }

  /**
   * Update user's role in organization
   */
  async updateRole(
    userId: string,
    orgId: string,
    role: "admin" | "editor" | "viewer",
  ): Promise<void> {
    this.logger.log(
      `Updating role for user ${userId} in organization ${orgId} to: ${role}`,
    );

    try {
      await this.db
        .update(userOrganizations)
        .set({ role })
        .where(
          and(
            eq(userOrganizations.userId, userId),
            eq(userOrganizations.orgId, orgId),
          ),
        );

      this.logger.log(
        `Role updated successfully for user ${userId} in organization ${orgId}`,
      );
    } catch (error) {
      const errorStack = error instanceof Error ? error.stack : "";
      this.logger.error(
        `Failed to update role for user ${userId} in organization ${orgId}`,
        errorStack,
      );
      throw error;
    }
  }

  //#endregion

  //#region ==================== GROUP OPERATIONS ====================

  /**
   * Add user to group
   */
  async addToGroup(userId: string, groupId: string): Promise<void> {
    this.logger.log(`Adding user ${userId} to group ${groupId}`);

    try {
      await this.db.insert(userGroups).values({
        userId,
        groupId,
      });

      this.logger.log(`User ${userId} added to group ${groupId} successfully`);
    } catch (error) {
      const errorStack = error instanceof Error ? error.stack : "";
      this.logger.error(
        `Failed to add user ${userId} to group ${groupId}`,
        errorStack,
      );
      throw error;
    }
  }

  /**
   * Remove user from group
   */
  async removeFromGroup(userId: string, groupId: string): Promise<void> {
    this.logger.log(`Removing user ${userId} from group ${groupId}`);

    try {
      await this.db
        .delete(userGroups)
        .where(
          and(eq(userGroups.userId, userId), eq(userGroups.groupId, groupId)),
        );

      this.logger.log(
        `User ${userId} removed from group ${groupId} successfully`,
      );
    } catch (error) {
      const errorStack = error instanceof Error ? error.stack : "";
      this.logger.error(
        `Failed to remove user ${userId} from group ${groupId}`,
        errorStack,
      );
      throw error;
    }
  }

  /**
   * Get all groups for a user
   */
  async getUserGroups(userId: string): Promise<UserWithGroups["groups"]> {
    this.logger.log(`Getting groups for user: ${userId}`);

    try {
      const userGroupsList = await this.db
        .select({
          id: groups.id,
          name: groups.name,
          orgId: groups.orgId,
        })
        .from(groups)
        .innerJoin(userGroups, eq(groups.id, userGroups.groupId))
        .where(eq(userGroups.userId, userId));

      this.logger.log(
        `Found ${userGroupsList.length} groups for user: ${userId}`,
      );

      return userGroupsList;
    } catch (error) {
      const errorStack = error instanceof Error ? error.stack : "";
      this.logger.error(`Failed to get groups for user: ${userId}`, errorStack);
      throw error;
    }
  }

  //#endregion

  //#region ==================== PAGINATION SUPPORT ====================

  /**
   * Find all users with pagination
   */
  async findAll(
    page = 1,
    limit = 20,
  ): Promise<{ users: UserEntity[]; total: number }> {
    this.logger.log(`Finding all users (page: ${page}, limit: ${limit})`);

    try {
      const offset = (page - 1) * limit;

      const usersList = await this.db
        .select()
        .from(users)
        .orderBy(desc(users.createdAt))
        .limit(limit)
        .offset(offset);

      const total = await this.db.$count(users);

      this.logger.log(`Found ${usersList.length} users (total: ${total})`);

      return {
        users: usersList,
        total,
      };
    } catch (error) {
      const errorStack = error instanceof Error ? error.stack : "";
      this.logger.error("Failed to find all users", errorStack);
      throw error;
    }
  }

  //#endregion
}
