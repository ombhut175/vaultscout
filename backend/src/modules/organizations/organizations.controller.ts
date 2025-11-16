import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
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
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
} from "@nestjs/swagger";
import { Request } from "express";
import { OrganizationsService } from "./organizations.service";
import {
  CreateOrganizationDto,
  UpdateOrganizationDto,
  OrganizationResponseDto,
  OrganizationStatsDto,
} from "./dto";
import { AuthGuard } from "../../common/guards/auth.guard";
import {
  successResponse,
  createdResponse,
} from "../../common/helpers/api-response.helper";

@ApiTags("Organizations")
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller("organizations")
export class OrganizationsController {
  private readonly logger = new Logger(OrganizationsController.name);

  constructor(private readonly organizationsService: OrganizationsService) {}

  //#region ==================== CRUD ENDPOINTS ====================

  @ApiOperation({
    summary: "Get user's organizations",
    description:
      "Retrieve all organizations that the current user belongs to with their role",
  })
  @ApiResponse({
    status: 200,
    description: "Organizations retrieved successfully",
    type: [OrganizationResponseDto],
  })
  @ApiUnauthorizedResponse({
    description: "Invalid or missing authentication token",
  })
  @Get()
  async findAll(@Req() request: Request) {
    const userId = (request as any).user.id;
    this.logger.log(`Finding organizations for user: ${userId}`);

    const organizations = await this.organizationsService.findAll(userId);

    this.logger.log(
      `Found ${organizations.length} organizations for user: ${userId}`,
    );

    return successResponse(
      organizations,
      "Organizations retrieved successfully",
    );
  }

  @ApiOperation({
    summary: "Get organization by ID",
    description: "Retrieve a specific organization by its ID",
  })
  @ApiParam({
    name: "id",
    description: "Organization ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @ApiResponse({
    status: 200,
    description: "Organization retrieved successfully",
    type: OrganizationResponseDto,
  })
  @ApiNotFoundResponse({
    description: "Organization not found",
  })
  @ApiUnauthorizedResponse({
    description: "Invalid or missing authentication token",
  })
  @Get(":id")
  async findOne(@Param("id") id: string) {
    this.logger.log(`Finding organization: ${id}`);

    const organization = await this.organizationsService.findOne(id);

    this.logger.log(`Organization found: ${id}`);

    return successResponse(organization, "Organization retrieved successfully");
  }

  @ApiOperation({
    summary: "Create new organization",
    description: "Create a new organization and add the creator as admin",
  })
  @ApiResponse({
    status: 201,
    description: "Organization created successfully",
    type: OrganizationResponseDto,
  })
  @ApiBadRequestResponse({
    description: "Invalid input data or validation errors",
  })
  @ApiConflictResponse({
    description: "Organization name already exists",
  })
  @ApiUnauthorizedResponse({
    description: "Invalid or missing authentication token",
  })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createDto: CreateOrganizationDto,
    @Req() request: Request,
  ) {
    const userId = (request as any).user.id;
    this.logger.log(
      `Creating organization: ${createDto.name} by user: ${userId}`,
    );

    const organization = await this.organizationsService.create(
      createDto,
      userId,
    );

    this.logger.log(`Organization created successfully: ${organization.id}`);

    return createdResponse(organization, "Organization created successfully");
  }

  @ApiOperation({
    summary: "Update organization",
    description: "Update an existing organization (admin only)",
  })
  @ApiParam({
    name: "id",
    description: "Organization ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @ApiResponse({
    status: 200,
    description: "Organization updated successfully",
    type: OrganizationResponseDto,
  })
  @ApiNotFoundResponse({
    description: "Organization not found",
  })
  @ApiBadRequestResponse({
    description: "Invalid input data or validation errors",
  })
  @ApiConflictResponse({
    description: "Organization name already exists",
  })
  @ApiUnauthorizedResponse({
    description: "Invalid or missing authentication token",
  })
  @Put(":id")
  async update(
    @Param("id") id: string,
    @Body() updateDto: UpdateOrganizationDto,
  ) {
    this.logger.log(`Updating organization: ${id}`);

    const organization = await this.organizationsService.update(id, updateDto);

    this.logger.log(`Organization updated successfully: ${id}`);

    return successResponse(organization, "Organization updated successfully");
  }

  @ApiOperation({
    summary: "Delete organization",
    description: "Delete an organization and all related data (admin only)",
  })
  @ApiParam({
    name: "id",
    description: "Organization ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @ApiResponse({
    status: 200,
    description: "Organization deleted successfully",
  })
  @ApiNotFoundResponse({
    description: "Organization not found",
  })
  @ApiUnauthorizedResponse({
    description: "Invalid or missing authentication token",
  })
  @Delete(":id")
  async delete(@Param("id") id: string) {
    this.logger.log(`Deleting organization: ${id}`);

    await this.organizationsService.delete(id);

    this.logger.log(`Organization deleted successfully: ${id}`);

    return successResponse(null, "Organization deleted successfully");
  }

  //#endregion

  //#region ==================== STATISTICS ENDPOINTS ====================

  @ApiOperation({
    summary: "Get organization statistics",
    description:
      "Retrieve statistics for an organization (users, groups, documents, storage)",
  })
  @ApiParam({
    name: "id",
    description: "Organization ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @ApiResponse({
    status: 200,
    description: "Statistics retrieved successfully",
    type: OrganizationStatsDto,
  })
  @ApiNotFoundResponse({
    description: "Organization not found",
  })
  @ApiUnauthorizedResponse({
    description: "Invalid or missing authentication token",
  })
  @Get(":id/stats")
  async getStats(@Param("id") id: string) {
    this.logger.log(`Getting statistics for organization: ${id}`);

    const stats = await this.organizationsService.getStats(id);

    this.logger.log(`Statistics retrieved for organization: ${id}`);

    return successResponse(stats, "Statistics retrieved successfully");
  }

  //#endregion
}
