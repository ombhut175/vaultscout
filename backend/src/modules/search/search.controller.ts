import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiBody,
} from "@nestjs/swagger";
import { SearchService } from "./search.service";
import {
  SearchQueryDto,
  SearchResponseDto,
  SearchHistoryResponseDto,
  SearchSuggestionsResponseDto,
} from "./dto";
import { AuthGuard, CurrentUser, successResponse } from "../../common";

@ApiTags("Search")
@Controller("search")
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Post()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Perform semantic search",
    description: `
      Performs semantic search across documents with ACL filtering.
      
      **Access Control:**
      - Only searches documents where the user belongs to at least one ACL group
      - Filters are applied after ACL check
      
      **Search Process:**
      1. Get user's accessible group IDs
      2. Get accessible document IDs based on groups
      3. Build Pinecone filter with document IDs and optional filters
      4. Perform vector search with query embedding
      5. Enrich results with document and chunk metadata
      6. Log search query to search_logs table
      
      **Filters:**
      - fileType: Filter by file extension (pdf, txt, docx, etc.)
      - tags: Filter by tags (array)
      - topK: Number of results to return (default: 10, max: 100)
    `,
  })
  @ApiBody({
    type: SearchQueryDto,
    description: "Search query parameters",
  })
  @ApiResponse({
    status: 200,
    description: "Search completed successfully",
    type: SearchResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized - authentication required",
  })
  @ApiResponse({
    status: 400,
    description: "Bad request - invalid query parameters",
  })
  async search(
    @CurrentUser("id") userId: string,
    @Body() searchQuery: SearchQueryDto,
  ) {
    const result = await this.searchService.semanticSearch(userId, searchQuery);
    return successResponse(result, "Search completed successfully");
  }

  @Get("history")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Get search history",
    description: `
      Retrieves the authenticated user's search history with pagination.
      
      **Pagination:**
      - page: Page number (1-indexed, default: 1)
      - limit: Items per page (default: 20)
      
      **Response:**
      - Returns search queries with filters, latency, match count, and timestamp
      - Ordered by creation date (most recent first)
    `,
  })
  @ApiQuery({
    name: "orgId",
    required: true,
    type: String,
    description: "Organization ID",
  })
  @ApiQuery({
    name: "page",
    required: false,
    type: Number,
    description: "Page number (1-indexed)",
  })
  @ApiQuery({
    name: "limit",
    required: false,
    type: Number,
    description: "Items per page",
  })
  @ApiResponse({
    status: 200,
    description: "Search history retrieved successfully",
    type: SearchHistoryResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized - authentication required",
  })
  async getHistory(
    @CurrentUser("id") userId: string,
    @Query("orgId") orgId: string,
    @Query("page", new ParseIntPipe({ optional: true })) page?: number,
    @Query("limit", new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    const result = await this.searchService.getSearchHistory(
      userId,
      orgId,
      page,
      limit,
    );
    return successResponse(result, "Search history retrieved successfully");
  }

  @Get("suggestions")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Get search suggestions",
    description: `
      Retrieves search suggestions based on the user's search history.
      
      **Algorithm:**
      - Analyzes last 100 searches
      - Groups by query text
      - Counts occurrences
      - Sorts by frequency and recency
      - Returns top N suggestions
      
      **Response:**
      - Returns suggested queries with count and last searched timestamp
      - Ordered by frequency (descending) and recency (descending)
    `,
  })
  @ApiQuery({
    name: "orgId",
    required: true,
    type: String,
    description: "Organization ID",
  })
  @ApiQuery({
    name: "limit",
    required: false,
    type: Number,
    description: "Number of suggestions (default: 10)",
  })
  @ApiResponse({
    status: 200,
    description: "Search suggestions retrieved successfully",
    type: SearchSuggestionsResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized - authentication required",
  })
  async getSuggestions(
    @CurrentUser("id") userId: string,
    @Query("orgId") orgId: string,
    @Query("limit", new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    const result = await this.searchService.getSearchSuggestions(
      userId,
      orgId,
      limit,
    );
    return successResponse(result, "Search suggestions retrieved successfully");
  }

  @Delete("history")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Clear search history",
    description: `
      Clears all search history for the authenticated user in the specified organization.
      
      **Operation:**
      - Deletes all search logs for the user in the organization
      - Returns the count of deleted entries
      
      **Response:**
      - Returns the number of deleted search history entries
    `,
  })
  @ApiQuery({
    name: "orgId",
    required: true,
    type: String,
    description: "Organization ID",
  })
  @ApiResponse({
    status: 200,
    description: "Search history cleared successfully",
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean", example: true },
        data: {
          type: "object",
          properties: {
            deletedCount: { type: "number", example: 15 },
            message: {
              type: "string",
              example: "Successfully cleared 15 search history entries",
            },
          },
        },
        message: {
          type: "string",
          example: "Search history cleared successfully",
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized - authentication required",
  })
  async clearHistory(
    @CurrentUser("id") userId: string,
    @Query("orgId") orgId: string,
  ) {
    const result = await this.searchService.clearSearchHistory(userId, orgId);
    return successResponse(result, "Search history cleared successfully");
  }
}
