import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from "@nestjs/common";
import { OrganizationsRepository } from "../../core/database/repositories";
import { MESSAGES } from "../../common/constants/string-const";
import {
  CreateOrganizationDto,
  UpdateOrganizationDto,
  OrganizationResponseDto,
  OrganizationStatsDto,
} from "./dto";

@Injectable()
export class OrganizationsService {
  private readonly logger = new Logger(OrganizationsService.name);

  constructor(
    private readonly organizationsRepository: OrganizationsRepository,
  ) {}

  //#region ==================== CRUD OPERATIONS ====================

  /**
   * Find all organizations for current user
   */
  async findAll(userId: string): Promise<OrganizationResponseDto[]> {
    this.logger.log(`Finding all organizations for user: ${userId}`);

    try {
      const organizations =
        await this.organizationsRepository.findByUser(userId);

      this.logger.log(
        `Found ${organizations.length} organizations for user: ${userId}`,
      );

      return organizations.map((org) => ({
        id: org.id,
        name: org.name,
        pineconeNamespace: org.pineconeNamespace,
        role: org.role,
        createdBy: org.createdBy,
        createdAt: org.createdAt,
        joinedAt: org.joinedAt,
      }));
    } catch (error) {
      const errorStack = error instanceof Error ? error.stack : "";
      this.logger.error(
        `Failed to find organizations for user: ${userId}`,
        errorStack,
      );
      throw error;
    }
  }

  /**
   * Find one organization with statistics
   */
  async findOne(id: string): Promise<OrganizationResponseDto> {
    this.logger.log(`Finding organization: ${id}`);

    try {
      const organization = await this.organizationsRepository.findById(id);

      if (!organization) {
        this.logger.warn(`Organization not found: ${id}`);
        throw new NotFoundException(
          MESSAGES.ORGANIZATION_NOT_FOUND || "Organization not found",
        );
      }

      this.logger.log(`Found organization: ${id}`);

      return {
        id: organization.id,
        name: organization.name,
        pineconeNamespace: organization.pineconeNamespace,
        createdBy: organization.createdBy,
        createdAt: organization.createdAt,
      };
    } catch (error) {
      const errorStack = error instanceof Error ? error.stack : "";
      this.logger.error(`Failed to find organization: ${id}`, errorStack);
      throw error;
    }
  }

  /**
   * Create new organization with Pinecone namespace generation
   */
  async create(
    createDto: CreateOrganizationDto,
    userId: string,
  ): Promise<OrganizationResponseDto> {
    this.logger.log(`Creating organization: ${createDto.name}`);

    try {
      // Check if organization name already exists
      const existingOrg = await this.organizationsRepository.findByName(
        createDto.name,
      );

      if (existingOrg) {
        this.logger.warn(`Organization name already exists: ${createDto.name}`);
        throw new ConflictException("Organization name already exists");
      }

      // Generate Pinecone namespace from organization name
      const pineconeNamespace = createDto.name
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");

      // Create organization
      const organization = await this.organizationsRepository.create({
        name: createDto.name,
        pineconeNamespace,
        createdBy: userId,
      });

      // Add creator as admin
      await this.organizationsRepository.addMember(
        organization.id,
        userId,
        "admin",
      );

      this.logger.log(
        `Organization created successfully: ${createDto.name} (ID: ${organization.id})`,
      );

      return {
        id: organization.id,
        name: organization.name,
        pineconeNamespace: organization.pineconeNamespace,
        createdBy: organization.createdBy,
        createdAt: organization.createdAt,
      };
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      const errorStack = error instanceof Error ? error.stack : "";
      this.logger.error(
        `Failed to create organization: ${createDto.name}`,
        errorStack,
      );
      throw new BadRequestException("Failed to create organization");
    }
  }

  /**
   * Update organization with validation
   */
  async update(
    id: string,
    updateDto: UpdateOrganizationDto,
  ): Promise<OrganizationResponseDto> {
    this.logger.log(`Updating organization: ${id}`);

    try {
      // Check if organization exists
      const existingOrg = await this.organizationsRepository.findById(id);
      if (!existingOrg) {
        this.logger.warn(`Organization not found: ${id}`);
        throw new NotFoundException(
          MESSAGES.ORGANIZATION_NOT_FOUND || "Organization not found",
        );
      }

      // Check if new name conflicts with existing organization
      if (updateDto.name && updateDto.name !== existingOrg.name) {
        const nameConflict = await this.organizationsRepository.findByName(
          updateDto.name,
        );
        if (nameConflict) {
          this.logger.warn(
            `Organization name already exists: ${updateDto.name}`,
          );
          throw new ConflictException("Organization name already exists");
        }
      }

      // Update organization
      const organization = await this.organizationsRepository.update(id, {
        name: updateDto.name,
      });

      this.logger.log(`Organization updated successfully: ${id}`);

      return {
        id: organization.id,
        name: organization.name,
        pineconeNamespace: organization.pineconeNamespace,
        createdBy: organization.createdBy,
        createdAt: organization.createdAt,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      const errorStack = error instanceof Error ? error.stack : "";
      this.logger.error(`Failed to update organization: ${id}`, errorStack);
      throw new BadRequestException("Failed to update organization");
    }
  }

  /**
   * Delete organization (cascade to groups, documents)
   */
  async delete(id: string): Promise<void> {
    this.logger.log(`Deleting organization: ${id}`);

    try {
      // Check if organization exists
      const existingOrg = await this.organizationsRepository.findById(id);
      if (!existingOrg) {
        this.logger.warn(`Organization not found: ${id}`);
        throw new NotFoundException(
          MESSAGES.ORGANIZATION_NOT_FOUND || "Organization not found",
        );
      }

      // Delete organization (cascade will handle related records)
      await this.organizationsRepository.delete(id);

      this.logger.log(`Organization deleted successfully: ${id}`);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      const errorStack = error instanceof Error ? error.stack : "";
      this.logger.error(`Failed to delete organization: ${id}`, errorStack);
      throw new BadRequestException("Failed to delete organization");
    }
  }

  //#endregion

  //#region ==================== STATISTICS ====================

  /**
   * Get organization statistics (users, groups, documents, storage)
   */
  async getStats(id: string): Promise<OrganizationStatsDto> {
    this.logger.log(`Getting statistics for organization: ${id}`);

    try {
      // Check if organization exists
      const existingOrg = await this.organizationsRepository.findById(id);
      if (!existingOrg) {
        this.logger.warn(`Organization not found: ${id}`);
        throw new NotFoundException(
          MESSAGES.ORGANIZATION_NOT_FOUND || "Organization not found",
        );
      }

      // Get statistics
      const stats = await this.organizationsRepository.getStats(id);

      this.logger.log(`Statistics retrieved for organization: ${id}`);

      return {
        usersCount: stats.usersCount,
        groupsCount: stats.groupsCount,
        documentsCount: stats.documentsCount,
        storageUsed: 0, // TODO: Calculate storage from files table
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      const errorStack = error instanceof Error ? error.stack : "";
      this.logger.error(
        `Failed to get statistics for organization: ${id}`,
        errorStack,
      );
      throw new BadRequestException("Failed to get organization statistics");
    }
  }

  //#endregion
}
