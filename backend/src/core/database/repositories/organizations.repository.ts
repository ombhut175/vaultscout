import { Injectable } from "@nestjs/common";
import { BaseRepository } from "./base.repository";
import { organizations } from "../schema/organizations";
import { userOrganizations } from "../schema/user-organizations";
import { groups } from "../schema/groups";
import { documents } from "../schema/documents";
import { eq, and, desc, count as drizzleCount } from "drizzle-orm";
import { MESSAGES } from "../../../common/constants/string-const";

export interface CreateOrganizationDto {
  name: string;
  pineconeNamespace?: string;
  createdBy: string;
}

export interface UpdateOrganizationDto {
  name?: string;
  pineconeNamespace?: string;
}

export interface OrganizationEntity {
  id: string;
  name: string;
  pineconeNamespace: string;
  createdBy: string | null;
  createdAt: Date;
}

export interface OrganizationWithRole extends OrganizationEntity {
  role: "admin" | "editor" | "viewer";
  joinedAt: Date;
}

export interface OrganizationStats {
  usersCount: number;
  groupsCount: number;
  documentsCount: number;
}

export interface OrganizationWithStats extends OrganizationEntity {
  stats: OrganizationStats;
}

@Injectable()
export class OrganizationsRepository extends BaseRepository<OrganizationEntity> {
  //#region ==================== CRUD OPERATIONS ====================

  async create(orgData: CreateOrganizationDto): Promise<OrganizationEntity> {
    this.logger.log(`Creating organization: ${orgData.name}`);

    try {
      const result = await this.db
        .insert(organizations)
        .values({
          name: orgData.name,
          pineconeNamespace: orgData.pineconeNamespace || "__default__",
          createdBy: orgData.createdBy,
        })
        .returning();

      this.logger.log(
        `Organization created successfully: ${orgData.name} (ID: ${result[0].id})`,
      );
      return result[0] as OrganizationEntity;
    } catch (error) {
      const errorStack = error instanceof Error ? error.stack : "";
      this.logger.error(
        `Failed to create organization: ${orgData.name}`,
        errorStack,
      );
      throw error;
    }
  }

  async findById(id: string): Promise<OrganizationEntity | null> {
    this.logger.log(`Finding organization by ID: ${id}`);
    const result = await this.findOne(organizations, eq(organizations.id, id));
    if (result) {
      this.logger.log(`Organization found: ${result.name} (ID: ${id})`);
    } else {
      this.logger.log(`Organization not found with ID: ${id}`);
    }
    return result;
  }

  async findByIdOrThrow(id: string): Promise<OrganizationEntity> {
    return super.findByIdOrThrow(
      organizations,
      id,
      MESSAGES.ORGANIZATION_NOT_FOUND || "Organization not found",
    );
  }

  async findByName(name: string): Promise<OrganizationEntity | null> {
    this.logger.log(`Finding organization by name: ${name}`);
    const result = await this.findOne(
      organizations,
      eq(organizations.name, name),
    );
    if (result) {
      this.logger.log(
        `Organization found with name: ${name} (ID: ${result.id})`,
      );
    } else {
      this.logger.log(`Organization not found with name: ${name}`);
    }
    return result;
  }

  async findAll(): Promise<OrganizationEntity[]> {
    this.logger.log("Finding all organizations");

    try {
      const orgList = await this.db
        .select()
        .from(organizations)
        .orderBy(desc(organizations.createdAt));

      this.logger.log(`Found ${orgList.length} organizations`);
      return orgList;
    } catch (error) {
      const errorStack = error instanceof Error ? error.stack : "";
      this.logger.error("Failed to find all organizations", errorStack);
      throw error;
    }
  }

  async update(
    id: string,
    orgData: UpdateOrganizationDto,
  ): Promise<OrganizationEntity> {
    this.logger.log(`Updating organization: ${id}`);

    try {
      const updateData: any = {};

      if (orgData.name !== undefined) {
        updateData.name = orgData.name;
      }
      if (orgData.pineconeNamespace !== undefined) {
        updateData.pineconeNamespace = orgData.pineconeNamespace;
      }

      const result = await this.db
        .update(organizations)
        .set(updateData)
        .where(eq(organizations.id, id))
        .returning();

      if (!result.length) {
        this.logger.warn(`Organization not found for update: ${id}`);
        throw new Error(
          MESSAGES.ORGANIZATION_NOT_FOUND || "Organization not found",
        );
      }

      this.logger.log(`Organization updated successfully: ${id}`);
      return result[0] as OrganizationEntity;
    } catch (error) {
      const errorStack = error instanceof Error ? error.stack : "";
      this.logger.error(`Failed to update organization: ${id}`, errorStack);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    this.logger.log(`Deleting organization: ${id}`);

    try {
      const result = await this.db
        .delete(organizations)
        .where(eq(organizations.id, id))
        .returning();

      if (!result.length) {
        this.logger.warn(`Organization not found for deletion: ${id}`);
        throw new Error(
          MESSAGES.ORGANIZATION_NOT_FOUND || "Organization not found",
        );
      }

      this.logger.log(`Organization deleted successfully: ${id}`);
    } catch (error) {
      const errorStack = error instanceof Error ? error.stack : "";
      this.logger.error(`Failed to delete organization: ${id}`, errorStack);
      throw error;
    }
  }

  //#endregion

  //#region ==================== USER OPERATIONS ====================

  /**
   * Find organizations by user with role
   */
  async findByUser(userId: string): Promise<OrganizationWithRole[]> {
    this.logger.log(`Finding organizations for user: ${userId}`);

    try {
      const orgList = await this.db
        .select({
          id: organizations.id,
          name: organizations.name,
          pineconeNamespace: organizations.pineconeNamespace,
          createdBy: organizations.createdBy,
          createdAt: organizations.createdAt,
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
        `Found ${orgList.length} organizations for user: ${userId}`,
      );

      return orgList;
    } catch (error) {
      const errorStack = error instanceof Error ? error.stack : "";
      this.logger.error(
        `Failed to find organizations for user: ${userId}`,
        errorStack,
      );
      throw error;
    }
  }

  //#endregion

  //#region ==================== STATISTICS OPERATIONS ====================

  /**
   * Find organization with statistics
   */
  async findWithStats(id: string): Promise<OrganizationWithStats | null> {
    this.logger.log(`Finding organization with stats: ${id}`);

    try {
      // Get organization
      const org = await this.findById(id);
      if (!org) {
        this.logger.log(`Organization not found: ${id}`);
        return null;
      }

      // Get statistics
      const stats = await this.getStats(id);

      this.logger.log(`Found organization with stats: ${id}`);

      return {
        ...org,
        stats,
      };
    } catch (error) {
      const errorStack = error instanceof Error ? error.stack : "";
      this.logger.error(
        `Failed to find organization with stats: ${id}`,
        errorStack,
      );
      throw error;
    }
  }

  /**
   * Get organization statistics
   */
  async getStats(orgId: string): Promise<OrganizationStats> {
    this.logger.log(`Getting statistics for organization: ${orgId}`);

    try {
      // Count users in organization
      const usersCountResult = await this.db
        .select({ count: drizzleCount() })
        .from(userOrganizations)
        .where(eq(userOrganizations.orgId, orgId));

      // Count groups in organization
      const groupsCountResult = await this.db
        .select({ count: drizzleCount() })
        .from(groups)
        .where(eq(groups.orgId, orgId));

      // Count documents in organization
      const documentsCountResult = await this.db
        .select({ count: drizzleCount() })
        .from(documents)
        .where(eq(documents.orgId, orgId));

      const stats = {
        usersCount: usersCountResult[0]?.count || 0,
        groupsCount: groupsCountResult[0]?.count || 0,
        documentsCount: documentsCountResult[0]?.count || 0,
      };

      this.logger.log(
        `Statistics for organization ${orgId}: ${JSON.stringify(stats)}`,
      );

      return stats;
    } catch (error) {
      const errorStack = error instanceof Error ? error.stack : "";
      this.logger.error(
        `Failed to get statistics for organization: ${orgId}`,
        errorStack,
      );
      throw error;
    }
  }

  //#endregion

  //#region ==================== MEMBER MANAGEMENT ====================

  /**
   * Add member to organization
   */
  async addMember(
    orgId: string,
    userId: string,
    role: "admin" | "editor" | "viewer",
  ): Promise<void> {
    this.logger.log(
      `Adding member ${userId} to organization ${orgId} with role: ${role}`,
    );

    try {
      await this.db.insert(userOrganizations).values({
        userId,
        orgId,
        role,
      });

      this.logger.log(
        `Member ${userId} added to organization ${orgId} successfully`,
      );
    } catch (error) {
      const errorStack = error instanceof Error ? error.stack : "";
      this.logger.error(
        `Failed to add member ${userId} to organization ${orgId}`,
        errorStack,
      );
      throw error;
    }
  }

  /**
   * Remove member from organization
   */
  async removeMember(orgId: string, userId: string): Promise<void> {
    this.logger.log(`Removing member ${userId} from organization ${orgId}`);

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
        `Member ${userId} removed from organization ${orgId} successfully`,
      );
    } catch (error) {
      const errorStack = error instanceof Error ? error.stack : "";
      this.logger.error(
        `Failed to remove member ${userId} from organization ${orgId}`,
        errorStack,
      );
      throw error;
    }
  }

  /**
   * Update member role in organization
   */
  async updateMemberRole(
    orgId: string,
    userId: string,
    role: "admin" | "editor" | "viewer",
  ): Promise<void> {
    this.logger.log(
      `Updating role for member ${userId} in organization ${orgId} to: ${role}`,
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
        `Role updated successfully for member ${userId} in organization ${orgId}`,
      );
    } catch (error) {
      const errorStack = error instanceof Error ? error.stack : "";
      this.logger.error(
        `Failed to update role for member ${userId} in organization ${orgId}`,
        errorStack,
      );
      throw error;
    }
  }

  //#endregion

  //#region ==================== UTILITY OPERATIONS ====================

  /**
   * Check if organization name exists
   */
  async nameExists(name: string): Promise<boolean> {
    this.logger.log(`Checking if organization name exists: ${name}`);
    const exists = await this.exists(
      organizations,
      eq(organizations.name, name),
    );
    this.logger.log(`Organization name exists check for ${name}: ${exists}`);
    return exists;
  }

  /**
   * Get total organizations count
   */
  async getOrganizationsCount(): Promise<number> {
    this.logger.log("Counting total organizations");
    return this.count(organizations);
  }

  //#endregion
}
