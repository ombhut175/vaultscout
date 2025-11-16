import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from "@nestjs/common";
import { UsersRepository } from "../../core/database/repositories";
import { MESSAGES } from "../../common/constants/string-const";
import {
  UpdateUserDto,
  AddToOrganizationDto,
  UserFiltersDto,
  UserResponseDto,
  UserWithOrganizationsDto,
  UserWithGroupsDto,
  PaginatedUsersResponseDto,
} from "./dto";

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly usersRepository: UsersRepository) {}

  //#region ==================== CRUD OPERATIONS ====================

  /**
   * Find all users with optional filters
   */
  async findAll(filters: UserFiltersDto): Promise<PaginatedUsersResponseDto> {
    this.logger.log(`Finding users with filters: ${JSON.stringify(filters)}`);

    try {
      const { orgId, role, page = 1, limit = 20 } = filters;

      let users: any[];
      let total: number;

      if (orgId) {
        // Filter by organization
        const result = await this.usersRepository.findByOrganization(
          orgId,
          role,
          page,
          limit,
        );
        users = result.users;
        total = result.total;
      } else {
        // Get all users
        const result = await this.usersRepository.findAll(page, limit);
        users = result.users;
        total = result.total;
      }

      const totalPages = Math.ceil(total / limit);

      this.logger.log(
        `Found ${users.length} users (total: ${total}, page: ${page}/${totalPages})`,
      );

      return {
        users: users.map((user) => ({
          id: user.id,
          externalUserId: user.externalUserId,
          email: user.email,
          createdAt: user.createdAt,
          role: user.role,
          joinedAt: user.joinedAt,
        })),
        total,
        page,
        limit,
        totalPages,
      };
    } catch (error) {
      const errorStack = error instanceof Error ? error.stack : "";
      this.logger.error(
        `Failed to find users with filters: ${JSON.stringify(filters)}`,
        errorStack,
      );
      throw error;
    }
  }

  /**
   * Find one user by ID or externalUserId
   * First tries to find by database ID, then by externalUserId (Supabase ID)
   */
  async findOne(id: string): Promise<UserResponseDto> {
    this.logger.log(`Finding user: ${id}`);

    try {
      let user = await this.usersRepository.findById(id);

      if (!user) {
        this.logger.log(`User not found by database ID, trying externalUserId: ${id}`);
        user = await this.usersRepository.findByExternalUserId(id);
      }

      if (!user) {
        this.logger.warn(`User not found: ${id}`);
        throw new NotFoundException(
          MESSAGES.USER_NOT_FOUND || "User not found",
        );
      }

      this.logger.log(`Found user: ${id}`);

      return {
        id: user.id,
        externalUserId: user.externalUserId,
        email: user.email,
        createdAt: user.createdAt,
      };
    } catch (error) {
      const errorStack = error instanceof Error ? error.stack : "";
      this.logger.error(`Failed to find user: ${id}`, errorStack);
      throw error;
    }
  }

  /**
   * Update user
   */
  async update(id: string, updateDto: UpdateUserDto): Promise<UserResponseDto> {
    this.logger.log(`Updating user: ${id}`);

    try {
      // Check if user exists
      const existingUser = await this.usersRepository.findById(id);
      if (!existingUser) {
        this.logger.warn(`User not found: ${id}`);
        throw new NotFoundException(
          MESSAGES.USER_NOT_FOUND || "User not found",
        );
      }

      // Check if email is being changed and if it conflicts
      if (updateDto.email && updateDto.email !== existingUser.email) {
        const emailConflict = await this.usersRepository.findByEmail(
          updateDto.email,
        );
        if (emailConflict && emailConflict.id !== id) {
          this.logger.warn(`Email already exists: ${updateDto.email}`);
          throw new ConflictException("Email already exists");
        }
      }

      // Update user
      const user = await this.usersRepository.update(id, {
        email: updateDto.email,
      });

      this.logger.log(`User updated successfully: ${id}`);

      return {
        id: user.id,
        externalUserId: user.externalUserId,
        email: user.email,
        createdAt: user.createdAt,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      const errorStack = error instanceof Error ? error.stack : "";
      this.logger.error(`Failed to update user: ${id}`, errorStack);
      throw new BadRequestException("Failed to update user");
    }
  }

  /**
   * Delete user
   */
  async delete(id: string): Promise<void> {
    this.logger.log(`Deleting user: ${id}`);

    try {
      // Check if user exists
      const existingUser = await this.usersRepository.findById(id);
      if (!existingUser) {
        this.logger.warn(`User not found: ${id}`);
        throw new NotFoundException(
          MESSAGES.USER_NOT_FOUND || "User not found",
        );
      }

      // Delete user (cascade will handle related records)
      await this.usersRepository.delete(id);

      this.logger.log(`User deleted successfully: ${id}`);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      const errorStack = error instanceof Error ? error.stack : "";
      this.logger.error(`Failed to delete user: ${id}`, errorStack);
      throw new BadRequestException("Failed to delete user");
    }
  }

  //#endregion

  //#region ==================== ORGANIZATION OPERATIONS ====================

  /**
   * Get user's organizations with roles
   */
  async getUserOrganizations(id: string): Promise<UserWithOrganizationsDto> {
    this.logger.log(`Getting organizations for user: ${id}`);

    try {
      const userWithOrgs = await this.usersRepository.findWithOrganizations(id);

      if (!userWithOrgs) {
        this.logger.warn(`User not found: ${id}`);
        throw new NotFoundException(
          MESSAGES.USER_NOT_FOUND || "User not found",
        );
      }

      this.logger.log(
        `Found ${userWithOrgs.organizations.length} organizations for user: ${id}`,
      );

      return {
        id: userWithOrgs.id,
        externalUserId: userWithOrgs.externalUserId,
        email: userWithOrgs.email,
        createdAt: userWithOrgs.createdAt,
        organizations: userWithOrgs.organizations,
      };
    } catch (error) {
      const errorStack = error instanceof Error ? error.stack : "";
      this.logger.error(
        `Failed to get organizations for user: ${id}`,
        errorStack,
      );
      throw error;
    }
  }

  /**
   * Add user to organization with role
   */
  async addToOrganization(
    id: string,
    addDto: AddToOrganizationDto,
  ): Promise<void> {
    this.logger.log(
      `Adding user ${id} to organization ${addDto.orgId} with role: ${addDto.role}`,
    );

    try {
      // Check if user exists
      const user = await this.usersRepository.findById(id);
      if (!user) {
        this.logger.warn(`User not found: ${id}`);
        throw new NotFoundException(
          MESSAGES.USER_NOT_FOUND || "User not found",
        );
      }

      // Add user to organization
      await this.usersRepository.addToOrganization(
        id,
        addDto.orgId,
        addDto.role,
      );

      this.logger.log(
        `User ${id} added to organization ${addDto.orgId} successfully`,
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      // Check for unique constraint violation (user already in org)
      if (error instanceof Error && error.message.includes("duplicate")) {
        this.logger.warn(`User ${id} already in organization ${addDto.orgId}`);
        throw new ConflictException("User already in organization");
      }
      const errorStack = error instanceof Error ? error.stack : "";
      this.logger.error(
        `Failed to add user ${id} to organization ${addDto.orgId}`,
        errorStack,
      );
      throw new BadRequestException("Failed to add user to organization");
    }
  }

  /**
   * Remove user from organization
   */
  async removeFromOrganization(userId: string, orgId: string): Promise<void> {
    this.logger.log(`Removing user ${userId} from organization ${orgId}`);

    try {
      // Check if user exists
      const user = await this.usersRepository.findById(userId);
      if (!user) {
        this.logger.warn(`User not found: ${userId}`);
        throw new NotFoundException(
          MESSAGES.USER_NOT_FOUND || "User not found",
        );
      }

      // Remove user from organization
      await this.usersRepository.removeFromOrganization(userId, orgId);

      this.logger.log(
        `User ${userId} removed from organization ${orgId} successfully`,
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      const errorStack = error instanceof Error ? error.stack : "";
      this.logger.error(
        `Failed to remove user ${userId} from organization ${orgId}`,
        errorStack,
      );
      throw new BadRequestException("Failed to remove user from organization");
    }
  }

  //#endregion

  //#region ==================== GROUP OPERATIONS ====================

  /**
   * Get user's groups
   */
  async getUserGroups(id: string): Promise<UserWithGroupsDto> {
    this.logger.log(`Getting groups for user: ${id}`);

    try {
      // Check if user exists
      const user = await this.usersRepository.findById(id);
      if (!user) {
        this.logger.warn(`User not found: ${id}`);
        throw new NotFoundException(
          MESSAGES.USER_NOT_FOUND || "User not found",
        );
      }

      // Get user's groups
      const groups = await this.usersRepository.getUserGroups(id);

      this.logger.log(`Found ${groups.length} groups for user: ${id}`);

      return {
        id: user.id,
        externalUserId: user.externalUserId,
        email: user.email,
        createdAt: user.createdAt,
        groups,
      };
    } catch (error) {
      const errorStack = error instanceof Error ? error.stack : "";
      this.logger.error(`Failed to get groups for user: ${id}`, errorStack);
      throw error;
    }
  }

  //#endregion
}
