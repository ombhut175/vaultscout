import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
} from "@nestjs/swagger";
import { Request } from "express";
import { GroupsService } from "./groups.service";
import {
  CreateGroupDto,
  UpdateGroupDto,
  AddMemberDto,
  GroupResponseDto,
  GroupMemberDto,
} from "./dto";
import { AuthGuard } from "../../common/guards/auth.guard";
import {
  successResponse,
  createdResponse,
} from "../../common/helpers/api-response.helper";

@ApiTags("Groups")
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller("groups")
export class GroupsController {
  private readonly logger = new Logger(GroupsController.name);

  constructor(private readonly groupsService: GroupsService) {}

  //#region ==================== CRUD ENDPOINTS ====================

  @ApiOperation({
    summary: "Get all groups",
    description: "Retrieve all groups for a specific organization",
  })
  @ApiQuery({
    name: "orgId",
    description: "Organization ID",
    required: true,
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @ApiResponse({
    status: 200,
    description: "Groups retrieved successfully",
    type: [GroupResponseDto],
  })
  @ApiUnauthorizedResponse({
    description: "Invalid or missing authentication token",
  })
  @Get()
  async findAll(@Query("orgId") orgId: string) {
    this.logger.log(`Finding groups for organization: ${orgId}`);

    const groups = await this.groupsService.findAll(orgId);

    this.logger.log(`Found ${groups.length} groups for organization: ${orgId}`);

    return successResponse(groups, "Groups retrieved successfully");
  }

  @ApiOperation({
    summary: "Get group by ID",
    description: "Retrieve a specific group by its ID",
  })
  @ApiParam({
    name: "id",
    description: "Group ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @ApiResponse({
    status: 200,
    description: "Group retrieved successfully",
    type: GroupResponseDto,
  })
  @ApiNotFoundResponse({
    description: "Group not found",
  })
  @ApiUnauthorizedResponse({
    description: "Invalid or missing authentication token",
  })
  @Get(":id")
  async findOne(@Param("id") id: string) {
    this.logger.log(`Finding group: ${id}`);

    const group = await this.groupsService.findOne(id);

    this.logger.log(`Group found: ${id}`);

    return successResponse(group, "Group retrieved successfully");
  }

  @ApiOperation({
    summary: "Create new group",
    description: "Create a new group in an organization (admin only)",
  })
  @ApiResponse({
    status: 201,
    description: "Group created successfully",
    type: GroupResponseDto,
  })
  @ApiBadRequestResponse({
    description: "Invalid input data or validation errors",
  })
  @ApiConflictResponse({
    description: "Group name already exists in organization",
  })
  @ApiUnauthorizedResponse({
    description: "Invalid or missing authentication token",
  })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createDto: CreateGroupDto, @Req() request: Request) {
    const userId = (request as any).user.id;
    this.logger.log(
      `Creating group: ${createDto.name} in organization: ${createDto.orgId} by user: ${userId}`,
    );

    const group = await this.groupsService.create(createDto, userId);

    this.logger.log(`Group created successfully: ${group.id}`);

    return createdResponse(group, "Group created successfully");
  }

  @ApiOperation({
    summary: "Update group",
    description: "Update an existing group (admin only)",
  })
  @ApiParam({
    name: "id",
    description: "Group ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @ApiResponse({
    status: 200,
    description: "Group updated successfully",
    type: GroupResponseDto,
  })
  @ApiNotFoundResponse({
    description: "Group not found",
  })
  @ApiBadRequestResponse({
    description: "Invalid input data or validation errors",
  })
  @ApiConflictResponse({
    description: "Group name already exists in organization",
  })
  @ApiUnauthorizedResponse({
    description: "Invalid or missing authentication token",
  })
  @Put(":id")
  async update(@Param("id") id: string, @Body() updateDto: UpdateGroupDto) {
    this.logger.log(`Updating group: ${id}`);

    const group = await this.groupsService.update(id, updateDto);

    this.logger.log(`Group updated successfully: ${id}`);

    return successResponse(group, "Group updated successfully");
  }

  @ApiOperation({
    summary: "Delete group",
    description: "Delete a group if it has no document ACLs (admin only)",
  })
  @ApiParam({
    name: "id",
    description: "Group ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @ApiResponse({
    status: 200,
    description: "Group deleted successfully",
  })
  @ApiNotFoundResponse({
    description: "Group not found",
  })
  @ApiBadRequestResponse({
    description: "Cannot delete group with document ACLs",
  })
  @ApiUnauthorizedResponse({
    description: "Invalid or missing authentication token",
  })
  @Delete(":id")
  async delete(@Param("id") id: string) {
    this.logger.log(`Deleting group: ${id}`);

    await this.groupsService.delete(id);

    this.logger.log(`Group deleted successfully: ${id}`);

    return successResponse(null, "Group deleted successfully");
  }

  //#endregion

  //#region ==================== MEMBER ENDPOINTS ====================

  @ApiOperation({
    summary: "Get group members",
    description: "Retrieve all members of a specific group",
  })
  @ApiParam({
    name: "id",
    description: "Group ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @ApiResponse({
    status: 200,
    description: "Members retrieved successfully",
    type: [GroupMemberDto],
  })
  @ApiNotFoundResponse({
    description: "Group not found",
  })
  @ApiUnauthorizedResponse({
    description: "Invalid or missing authentication token",
  })
  @Get(":id/members")
  async getMembers(@Param("id") id: string) {
    this.logger.log(`Getting members for group: ${id}`);

    const members = await this.groupsService.getMembers(id);

    this.logger.log(`Found ${members.length} members for group: ${id}`);

    return successResponse(members, "Members retrieved successfully");
  }

  @ApiOperation({
    summary: "Add member to group",
    description: "Add a user to a group (admin only)",
  })
  @ApiParam({
    name: "id",
    description: "Group ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @ApiResponse({
    status: 201,
    description: "Member added to group successfully",
  })
  @ApiNotFoundResponse({
    description: "Group or user not found",
  })
  @ApiBadRequestResponse({
    description: "Invalid input data or validation errors",
  })
  @ApiConflictResponse({
    description: "User already in group",
  })
  @ApiUnauthorizedResponse({
    description: "Invalid or missing authentication token",
  })
  @Post(":id/members")
  @HttpCode(HttpStatus.CREATED)
  async addMember(@Param("id") id: string, @Body() addMemberDto: AddMemberDto) {
    this.logger.log(`Adding member ${addMemberDto.userId} to group ${id}`);

    await this.groupsService.addMember(id, addMemberDto);

    this.logger.log(
      `Member ${addMemberDto.userId} added to group ${id} successfully`,
    );

    return createdResponse(null, "Member added to group successfully");
  }

  @ApiOperation({
    summary: "Remove member from group",
    description: "Remove a user from a group (admin only)",
  })
  @ApiParam({
    name: "id",
    description: "Group ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @ApiParam({
    name: "userId",
    description: "User ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @ApiResponse({
    status: 200,
    description: "Member removed from group successfully",
  })
  @ApiNotFoundResponse({
    description: "Group not found",
  })
  @ApiUnauthorizedResponse({
    description: "Invalid or missing authentication token",
  })
  @Delete(":id/members/:userId")
  async removeMember(@Param("id") id: string, @Param("userId") userId: string) {
    this.logger.log(`Removing member ${userId} from group ${id}`);

    await this.groupsService.removeMember(id, userId);

    this.logger.log(`Member ${userId} removed from group ${id} successfully`);

    return successResponse(null, "Member removed from group successfully");
  }

  //#endregion
}
