import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Post,
  UseGuards,
  HttpCode,
  HttpStatus,
  Logger,
  Request,
  UnauthorizedException,
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
import { UsersService } from "./users.service";
import {
  UpdateUserDto,
  AddToOrganizationDto,
  UserFiltersDto,
  UserResponseDto,
  UserWithOrganizationsDto,
  UserWithGroupsDto,
  PaginatedUsersResponseDto,
} from "./dto";
import { AuthGuard } from "../../common/guards/auth.guard";
import {
  successResponse,
  createdResponse,
} from "../../common/helpers/api-response.helper";

@ApiTags("Users")
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller("users")
export class UsersController {
  private readonly logger = new Logger(UsersController.name);

  constructor(private readonly usersService: UsersService) {}

  //#region ==================== CRUD ENDPOINTS ====================

  @ApiOperation({
    summary: "Get all users",
    description:
      "Retrieve all users with optional filters (organization, role, pagination)",
  })
  @ApiQuery({
    name: "orgId",
    description: "Filter by organization ID",
    required: false,
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @ApiQuery({
    name: "role",
    description: "Filter by role",
    required: false,
    enum: ["admin", "editor", "viewer"],
  })
  @ApiQuery({
    name: "page",
    description: "Page number",
    required: false,
    example: 1,
  })
  @ApiQuery({
    name: "limit",
    description: "Items per page",
    required: false,
    example: 20,
  })
  @ApiResponse({
    status: 200,
    description: "Users retrieved successfully",
    type: PaginatedUsersResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: "Invalid or missing authentication token",
  })
  @Get()
  async findAll(@Query() filters: UserFiltersDto) {
    this.logger.log(`Finding users with filters: ${JSON.stringify(filters)}`);

    const result = await this.usersService.findAll(filters);

    this.logger.log(
      `Found ${result.users.length} users (total: ${result.total})`,
    );

    return successResponse(result, "Users retrieved successfully");
  }

  @ApiOperation({
    summary: "Get user by ID",
    description: "Retrieve a specific user by their ID",
  })
  @ApiParam({
    name: "id",
    description: "User ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @ApiResponse({
    status: 200,
    description: "User retrieved successfully",
    type: UserResponseDto,
  })
  @ApiNotFoundResponse({
    description: "User not found",
  })
  @ApiUnauthorizedResponse({
    description: "Invalid or missing authentication token",
  })
  @Get(":id")
  async findOne(@Param("id") id: string, @Request() req: any) {
    const userId = id === 'me' ? req.user?.id : id;
    
    if (!userId) {
      throw new UnauthorizedException("User not authenticated");
    }

    this.logger.log(`Finding user: ${userId}`);

    const user = await this.usersService.findOne(userId);

    this.logger.log(`User found: ${userId}`);

    return successResponse(user, "User retrieved successfully");
  }

  @ApiOperation({
    summary: "Update user",
    description: "Update user information (admin only)",
  })
  @ApiParam({
    name: "id",
    description: "User ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @ApiResponse({
    status: 200,
    description: "User updated successfully",
    type: UserResponseDto,
  })
  @ApiNotFoundResponse({
    description: "User not found",
  })
  @ApiBadRequestResponse({
    description: "Invalid input data or validation errors",
  })
  @ApiConflictResponse({
    description: "Email already exists",
  })
  @ApiUnauthorizedResponse({
    description: "Invalid or missing authentication token",
  })
  @Put(":id")
  async update(@Param("id") id: string, @Body() updateDto: UpdateUserDto) {
    this.logger.log(`Updating user: ${id}`);

    const user = await this.usersService.update(id, updateDto);

    this.logger.log(`User updated successfully: ${id}`);

    return successResponse(user, "User updated successfully");
  }

  @ApiOperation({
    summary: "Delete user",
    description: "Delete a user and all related data (admin only)",
  })
  @ApiParam({
    name: "id",
    description: "User ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @ApiResponse({
    status: 200,
    description: "User deleted successfully",
  })
  @ApiNotFoundResponse({
    description: "User not found",
  })
  @ApiUnauthorizedResponse({
    description: "Invalid or missing authentication token",
  })
  @Delete(":id")
  async delete(@Param("id") id: string) {
    this.logger.log(`Deleting user: ${id}`);

    await this.usersService.delete(id);

    this.logger.log(`User deleted successfully: ${id}`);

    return successResponse(null, "User deleted successfully");
  }

  //#endregion

  //#region ==================== ORGANIZATION ENDPOINTS ====================

  @ApiOperation({
    summary: "Get user's organizations",
    description:
      "Retrieve all organizations that a user belongs to with their roles",
  })
  @ApiParam({
    name: "id",
    description: "User ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @ApiResponse({
    status: 200,
    description: "Organizations retrieved successfully",
    type: UserWithOrganizationsDto,
  })
  @ApiNotFoundResponse({
    description: "User not found",
  })
  @ApiUnauthorizedResponse({
    description: "Invalid or missing authentication token",
  })
  @Get(":id/organizations")
  async getUserOrganizations(@Param("id") id: string, @Request() req: any) {
    const userId = id === 'me' ? req.user?.id : id;
    
    if (!userId) {
      throw new UnauthorizedException("User not authenticated");
    }

    this.logger.log(`Getting organizations for user: ${userId}`);

    const result = await this.usersService.getUserOrganizations(userId);

    this.logger.log(
      `Found ${result.organizations.length} organizations for user: ${userId}`,
    );

    return successResponse(result, "Organizations retrieved successfully");
  }

  @ApiOperation({
    summary: "Add user to organization",
    description:
      "Add a user to an organization with a specific role (admin only)",
  })
  @ApiParam({
    name: "id",
    description: "User ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @ApiResponse({
    status: 201,
    description: "User added to organization successfully",
  })
  @ApiNotFoundResponse({
    description: "User not found",
  })
  @ApiBadRequestResponse({
    description: "Invalid input data or validation errors",
  })
  @ApiConflictResponse({
    description: "User already in organization",
  })
  @ApiUnauthorizedResponse({
    description: "Invalid or missing authentication token",
  })
  @Post(":id/organizations")
  @HttpCode(HttpStatus.CREATED)
  async addToOrganization(
    @Param("id") id: string,
    @Body() addDto: AddToOrganizationDto,
  ) {
    this.logger.log(
      `Adding user ${id} to organization ${addDto.orgId} with role: ${addDto.role}`,
    );

    await this.usersService.addToOrganization(id, addDto);

    this.logger.log(
      `User ${id} added to organization ${addDto.orgId} successfully`,
    );

    return createdResponse(null, "User added to organization successfully");
  }

  @ApiOperation({
    summary: "Remove user from organization",
    description: "Remove a user from an organization (admin only)",
  })
  @ApiParam({
    name: "userId",
    description: "User ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @ApiParam({
    name: "orgId",
    description: "Organization ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @ApiResponse({
    status: 200,
    description: "User removed from organization successfully",
  })
  @ApiNotFoundResponse({
    description: "User not found",
  })
  @ApiUnauthorizedResponse({
    description: "Invalid or missing authentication token",
  })
  @Delete(":userId/organizations/:orgId")
  async removeFromOrganization(
    @Param("userId") userId: string,
    @Param("orgId") orgId: string,
  ) {
    this.logger.log(`Removing user ${userId} from organization ${orgId}`);

    await this.usersService.removeFromOrganization(userId, orgId);

    this.logger.log(
      `User ${userId} removed from organization ${orgId} successfully`,
    );

    return successResponse(null, "User removed from organization successfully");
  }

  //#endregion

  //#region ==================== GROUP ENDPOINTS ====================

  @ApiOperation({
    summary: "Get user's groups",
    description: "Retrieve all groups that a user belongs to",
  })
  @ApiParam({
    name: "id",
    description: "User ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @ApiResponse({
    status: 200,
    description: "Groups retrieved successfully",
    type: UserWithGroupsDto,
  })
  @ApiNotFoundResponse({
    description: "User not found",
  })
  @ApiUnauthorizedResponse({
    description: "Invalid or missing authentication token",
  })
  @Get(":id/groups")
  async getUserGroups(@Param("id") id: string, @Request() req: any) {
    const userId = id === 'me' ? req.user?.id : id;
    
    if (!userId) {
      throw new UnauthorizedException("User not authenticated");
    }

    this.logger.log(`Getting groups for user: ${userId}`);

    const result = await this.usersService.getUserGroups(userId);

    this.logger.log(`Found ${result.groups.length} groups for user: ${userId}`);

    return successResponse(result, "Groups retrieved successfully");
  }

  //#endregion
}
