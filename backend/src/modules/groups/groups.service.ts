import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from "@nestjs/common";
import {
  GroupsRepository,
  UsersRepository,
} from "../../core/database/repositories";
import { MESSAGES } from "../../common/constants/string-const";
import {
  CreateGroupDto,
  UpdateGroupDto,
  AddMemberDto,
  GroupResponseDto,
  GroupMemberDto,
} from "./dto";

@Injectable()
export class GroupsService {
  private readonly logger = new Logger(GroupsService.name);

  constructor(
    private readonly groupsRepository: GroupsRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  //#region ==================== CRUD OPERATIONS ====================

  /**
   * Find all groups for an organization
   */
  async findAll(orgId: string): Promise<GroupResponseDto[]> {
    this.logger.log(`Finding all groups for organization: ${orgId}`);

    try {
      const groups = await this.groupsRepository.findByOrganization(orgId);

      this.logger.log(
        `Found ${groups.length} groups for organization: ${orgId}`,
      );

      return groups.map((group) => ({
        id: group.id,
        orgId: group.orgId,
        name: group.name,
        createdBy: group.createdBy,
        createdAt: group.createdAt,
        memberCount: group.memberCount,
      }));
    } catch (error) {
      const errorStack = error instanceof Error ? error.stack : "";
      this.logger.error(
        `Failed to find groups for organization: ${orgId}`,
        errorStack,
      );
      throw error;
    }
  }

  /**
   * Find one group by ID
   */
  async findOne(id: string): Promise<GroupResponseDto> {
    this.logger.log(`Finding group: ${id}`);

    try {
      const group = await this.groupsRepository.findById(id);

      if (!group) {
        this.logger.warn(`Group not found: ${id}`);
        throw new NotFoundException(
          MESSAGES.GROUP_NOT_FOUND || "Group not found",
        );
      }

      // Get member count
      const memberCount = await this.groupsRepository.getMemberCount(id);

      this.logger.log(`Found group: ${id}`);

      return {
        id: group.id,
        orgId: group.orgId,
        name: group.name,
        createdBy: group.createdBy,
        createdAt: group.createdAt,
        memberCount,
      };
    } catch (error) {
      const errorStack = error instanceof Error ? error.stack : "";
      this.logger.error(`Failed to find group: ${id}`, errorStack);
      throw error;
    }
  }

  /**
   * Create new group
   */
  async create(
    createDto: CreateGroupDto,
    userId: string,
  ): Promise<GroupResponseDto> {
    this.logger.log(
      `Creating group: ${createDto.name} in organization: ${createDto.orgId}`,
    );

    try {
      // Check if group name already exists in organization
      const nameExists = await this.groupsRepository.nameExistsInOrg(
        createDto.orgId,
        createDto.name,
      );

      if (nameExists) {
        this.logger.warn(
          `Group name already exists in organization: ${createDto.name}`,
        );
        throw new ConflictException(
          "Group name already exists in this organization",
        );
      }

      // Create group
      const group = await this.groupsRepository.create({
        orgId: createDto.orgId,
        name: createDto.name,
        createdBy: userId,
      });

      this.logger.log(
        `Group created successfully: ${createDto.name} (ID: ${group.id})`,
      );

      return {
        id: group.id,
        orgId: group.orgId,
        name: group.name,
        createdBy: group.createdBy,
        createdAt: group.createdAt,
        memberCount: 0,
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
        `Failed to create group: ${createDto.name}`,
        errorStack,
      );
      throw new BadRequestException("Failed to create group");
    }
  }

  /**
   * Update group
   */
  async update(
    id: string,
    updateDto: UpdateGroupDto,
  ): Promise<GroupResponseDto> {
    this.logger.log(`Updating group: ${id}`);

    try {
      // Check if group exists
      const existingGroup = await this.groupsRepository.findById(id);
      if (!existingGroup) {
        this.logger.warn(`Group not found: ${id}`);
        throw new NotFoundException(
          MESSAGES.GROUP_NOT_FOUND || "Group not found",
        );
      }

      // Check if new name conflicts with existing group in same organization
      if (updateDto.name && updateDto.name !== existingGroup.name) {
        const nameExists = await this.groupsRepository.nameExistsInOrg(
          existingGroup.orgId,
          updateDto.name,
        );
        if (nameExists) {
          this.logger.warn(
            `Group name already exists in organization: ${updateDto.name}`,
          );
          throw new ConflictException(
            "Group name already exists in this organization",
          );
        }
      }

      // Update group
      const group = await this.groupsRepository.update(id, {
        name: updateDto.name,
      });

      // Get member count
      const memberCount = await this.groupsRepository.getMemberCount(id);

      this.logger.log(`Group updated successfully: ${id}`);

      return {
        id: group.id,
        orgId: group.orgId,
        name: group.name,
        createdBy: group.createdBy,
        createdAt: group.createdAt,
        memberCount,
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      const errorStack = error instanceof Error ? error.stack : "";
      this.logger.error(`Failed to update group: ${id}`, errorStack);
      throw new BadRequestException("Failed to update group");
    }
  }

  /**
   * Delete group (only if no document ACLs)
   */
  async delete(id: string): Promise<void> {
    this.logger.log(`Deleting group: ${id}`);

    try {
      // Check if group exists
      const existingGroup = await this.groupsRepository.findById(id);
      if (!existingGroup) {
        this.logger.warn(`Group not found: ${id}`);
        throw new NotFoundException(
          MESSAGES.GROUP_NOT_FOUND || "Group not found",
        );
      }

      // Check if group has document ACLs
      const hasDocumentAcls = await this.groupsRepository.hasDocumentAcls(id);
      if (hasDocumentAcls) {
        this.logger.warn(`Cannot delete group with document ACLs: ${id}`);
        throw new BadRequestException(
          "Cannot delete group that is used in document access control lists",
        );
      }

      // Delete group (cascade will handle user_groups)
      await this.groupsRepository.delete(id);

      this.logger.log(`Group deleted successfully: ${id}`);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      const errorStack = error instanceof Error ? error.stack : "";
      this.logger.error(`Failed to delete group: ${id}`, errorStack);
      throw new BadRequestException("Failed to delete group");
    }
  }

  //#endregion

  //#region ==================== MEMBER OPERATIONS ====================

  /**
   * Get group members
   */
  async getMembers(id: string): Promise<GroupMemberDto[]> {
    this.logger.log(`Getting members for group: ${id}`);

    try {
      // Check if group exists
      const group = await this.groupsRepository.findById(id);
      if (!group) {
        this.logger.warn(`Group not found: ${id}`);
        throw new NotFoundException(
          MESSAGES.GROUP_NOT_FOUND || "Group not found",
        );
      }

      // Get members
      const members = await this.groupsRepository.getMembers(id);

      this.logger.log(`Found ${members.length} members for group: ${id}`);

      return members.map((member) => ({
        userId: member.userId,
        email: member.email,
        joinedAt: member.joinedAt,
      }));
    } catch (error) {
      const errorStack = error instanceof Error ? error.stack : "";
      this.logger.error(`Failed to get members for group: ${id}`, errorStack);
      throw error;
    }
  }

  /**
   * Add member to group
   */
  async addMember(id: string, addMemberDto: AddMemberDto): Promise<void> {
    this.logger.log(`Adding member ${addMemberDto.userId} to group ${id}`);

    try {
      // Check if group exists
      const group = await this.groupsRepository.findById(id);
      if (!group) {
        this.logger.warn(`Group not found: ${id}`);
        throw new NotFoundException(
          MESSAGES.GROUP_NOT_FOUND || "Group not found",
        );
      }

      // Check if user exists
      const user = await this.usersRepository.findById(addMemberDto.userId);
      if (!user) {
        this.logger.warn(`User not found: ${addMemberDto.userId}`);
        throw new NotFoundException(
          MESSAGES.USER_NOT_FOUND || "User not found",
        );
      }

      // Add member to group
      await this.groupsRepository.addMember(id, addMemberDto.userId);

      this.logger.log(
        `Member ${addMemberDto.userId} added to group ${id} successfully`,
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      // Check for unique constraint violation (user already in group)
      if (error instanceof Error && error.message.includes("duplicate")) {
        this.logger.warn(`User ${addMemberDto.userId} already in group ${id}`);
        throw new ConflictException("User already in group");
      }
      const errorStack = error instanceof Error ? error.stack : "";
      this.logger.error(
        `Failed to add member ${addMemberDto.userId} to group ${id}`,
        errorStack,
      );
      throw new BadRequestException("Failed to add member to group");
    }
  }

  /**
   * Remove member from group
   */
  async removeMember(groupId: string, userId: string): Promise<void> {
    this.logger.log(`Removing member ${userId} from group ${groupId}`);

    try {
      // Check if group exists
      const group = await this.groupsRepository.findById(groupId);
      if (!group) {
        this.logger.warn(`Group not found: ${groupId}`);
        throw new NotFoundException(
          MESSAGES.GROUP_NOT_FOUND || "Group not found",
        );
      }

      // Remove member from group
      await this.groupsRepository.removeMember(groupId, userId);

      this.logger.log(
        `Member ${userId} removed from group ${groupId} successfully`,
      );
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      const errorStack = error instanceof Error ? error.stack : "";
      this.logger.error(
        `Failed to remove member ${userId} from group ${groupId}`,
        errorStack,
      );
      throw new BadRequestException("Failed to remove member from group");
    }
  }

  //#endregion
}
