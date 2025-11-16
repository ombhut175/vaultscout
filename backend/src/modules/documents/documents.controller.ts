import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
  UseGuards,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from "@nestjs/swagger";
import {
  DocumentUploadDto,
  DocumentUploadResponseDto,
  UpdateDocumentDto,
  DocumentFiltersDto,
  DocumentListResponseDto,
  DocumentResponseDto,
} from "./dto";
import { AuthGuard, CurrentUser, successResponse } from "../../common";
import { DocumentProcessingService, DocumentsService } from "./services";

@ApiTags("Documents")
@Controller("documents")
export class DocumentsController {
  constructor(
    private readonly documentProcessingService: DocumentProcessingService,
    private readonly documentsService: DocumentsService,
  ) {}

  @Post("upload")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Upload and queue document for processing",
    description: `
      Uploads a document file and queues it for background processing through the embedding pipeline.
      
      **Processing Steps (Background):**
      1. Validate file type and size (immediate)
      2. Create document record with status="queued" (immediate)
      3. Queue job for background processing (immediate)
      4. Upload raw file to vs-raw-private bucket (background)
      5. Extract text from the document (background)
      6. Save extracted text to vs-extracted-private bucket (background)
      7. Chunk the text with overlap for context preservation (background)
      8. Generate embeddings using HuggingFace BGE-large-en-v1.5 model (background)
      9. Upsert vectors to Pinecone with metadata (background)
      10. Persist all metadata to PostgreSQL database (background)
      11. Update document status to "ready" (background)
      
      **Supported File Types:**
      - Plain text files (.txt)
      - Markdown files (.md, .markdown)
      - JSON files (.json)
      - PDF files (.pdf) - MVP supports text extraction only
      - Word documents (.docx)
      
      **Access Control:**
      - Documents are scoped to organizations (orgId required)
      - Optional ACL groups for fine-grained access control
      - Created by authenticated user (automatically tracked)
      
      **Response:**
      - Returns immediately with document ID and job ID
      - Check document status using GET /api/documents/:id endpoint
    `,
  })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    description: "Document upload request with file and metadata",
    schema: {
      type: "object",
      required: ["file", "orgId", "title"],
      properties: {
        file: {
          type: "string",
          format: "binary",
          description:
            "Document file to upload (extension extracted automatically)",
        },
        orgId: {
          type: "string",
          format: "uuid",
          description: "Organization ID that owns the document",
          example: "550e8400-e29b-41d4-a716-446655440000",
        },
        title: {
          type: "string",
          description: "Document title",
          example: "Legal Contract 2024",
        },
        tags: {
          type: "array",
          items: { type: "string" },
          description: "Tags for document categorization",
          example: ["contract", "legal", "2024"],
        },
        aclGroups: {
          type: "array",
          items: { type: "string", format: "uuid" },
          description: "ACL group IDs for access control",
          example: ["550e8400-e29b-41d4-a716-446655440001"],
        },
        notes: {
          type: "string",
          description: "Version notes",
          example: "Initial upload",
        },
      },
    } as any,
  })
  @ApiResponse({
    status: 201,
    description: "Document uploaded and queued for processing",
    type: DocumentUploadResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: "Bad request - invalid file or missing required fields",
    schema: {
      type: "object",
      properties: {
        statusCode: { type: "number", example: 400 },
        message: { type: "string", example: "File is required" },
        error: { type: "string", example: "Bad Request" },
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: "Internal server error during processing",
    schema: {
      type: "object",
      properties: {
        statusCode: { type: "number", example: 500 },
        message: {
          type: "string",
          example: "Document processing failed: {error details}",
        },
        error: { type: "string", example: "Internal Server Error" },
      },
    },
  })
  @UseInterceptors(FileInterceptor("file"))
  async uploadDocument(
    @CurrentUser("id") userId: string,
    @Body() uploadDto: DocumentUploadDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<DocumentUploadResponseDto> {
    return this.documentProcessingService.queueDocumentForProcessing(
      uploadDto,
      file,
      userId,
    );
  }

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Get all documents in organization",
    description: `
      Retrieves a paginated list of documents accessible to the authenticated user.
      
      **Access Control:**
      - Only returns documents where the user belongs to at least one ACL group
      - Filters are applied after ACL check
      
      **Filters:**
      - status: Filter by processing status (queued, processing, ready, failed)
      - fileType: Filter by file extension (pdf, txt, docx, etc.)
      - tags: Filter by tags (array)
      - page: Page number (1-indexed, default: 1)
      - limit: Items per page (default: 20)
    `,
  })
  @ApiQuery({
    name: "orgId",
    required: true,
    type: String,
    description: "Organization ID",
  })
  @ApiQuery({
    name: "status",
    required: false,
    type: String,
    description: "Filter by status",
    enum: ["queued", "processing", "ready", "failed"],
  })
  @ApiQuery({
    name: "fileType",
    required: false,
    type: String,
    description: "Filter by file type",
  })
  @ApiQuery({
    name: "tags",
    required: false,
    type: [String],
    description: "Filter by tags",
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
    description: "Documents retrieved successfully",
    type: DocumentListResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized - authentication required",
  })
  async findAll(
    @CurrentUser("id") userId: string,
    @Query("orgId") orgId: string,
    @Query() filters: DocumentFiltersDto,
  ) {
    const result = await this.documentsService.findAll(orgId, userId, filters);
    return successResponse(result, "Documents retrieved successfully");
  }

  @Get(":id")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Get document by ID",
    description: `
      Retrieves a single document by ID with ACL check.
      
      **Access Control:**
      - Returns 403 if user does not belong to any of the document's ACL groups
      - Returns 404 if document does not exist
    `,
  })
  @ApiParam({
    name: "id",
    type: String,
    description: "Document ID",
  })
  @ApiResponse({
    status: 200,
    description: "Document retrieved successfully",
    type: DocumentResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized - authentication required",
  })
  @ApiResponse({
    status: 403,
    description: "Forbidden - user does not have access to this document",
  })
  @ApiResponse({
    status: 404,
    description: "Document not found",
  })
  async findOne(@CurrentUser("id") userId: string, @Param("id") id: string) {
    const document = await this.documentsService.findOne(id, userId);
    return successResponse(document, "Document retrieved successfully");
  }

  @Put(":id")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Update document metadata",
    description: `
      Updates document metadata (title, tags, ACL groups) with ACL check.
      
      **Access Control:**
      - Returns 403 if user does not belong to any of the document's ACL groups
      - Returns 404 if document does not exist
      
      **Updatable Fields:**
      - title: Document title
      - tags: Array of tags
      - aclGroups: Array of group IDs for access control
    `,
  })
  @ApiParam({
    name: "id",
    type: String,
    description: "Document ID",
  })
  @ApiBody({
    type: UpdateDocumentDto,
    description: "Document update data",
  })
  @ApiResponse({
    status: 200,
    description: "Document updated successfully",
    type: DocumentResponseDto,
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized - authentication required",
  })
  @ApiResponse({
    status: 403,
    description: "Forbidden - user does not have access to this document",
  })
  @ApiResponse({
    status: 404,
    description: "Document not found",
  })
  async update(
    @CurrentUser("id") userId: string,
    @Param("id") id: string,
    @Body() updateDto: UpdateDocumentDto,
  ) {
    const document = await this.documentsService.update(id, userId, updateDto);
    return successResponse(document, "Document updated successfully");
  }

  @Delete(":id")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Delete document",
    description: `
      Deletes a document with cascade (chunks, embeddings) and Pinecone cleanup.
      
      **Access Control:**
      - Returns 403 if user does not belong to any of the document's ACL groups
      - Returns 404 if document does not exist
      
      **Cascade Deletion:**
      - Deletes document record from PostgreSQL
      - Deletes all chunks associated with the document
      - Deletes all embeddings associated with the chunks
      - Deletes all vectors from Pinecone
      
      **Note:** Pinecone cleanup failures are logged but do not prevent deletion.
    `,
  })
  @ApiParam({
    name: "id",
    type: String,
    description: "Document ID",
  })
  @ApiResponse({
    status: 200,
    description: "Document deleted successfully",
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean", example: true },
        message: { type: "string", example: "Document deleted successfully" },
        data: {
          type: "object",
          properties: {
            message: {
              type: "string",
              example: "Document deleted successfully",
            },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized - authentication required",
  })
  @ApiResponse({
    status: 403,
    description: "Forbidden - user does not have access to this document",
  })
  @ApiResponse({
    status: 404,
    description: "Document not found",
  })
  async delete(@CurrentUser("id") userId: string, @Param("id") id: string) {
    const result = await this.documentsService.delete(id, userId);
    return successResponse(result, result.message);
  }

  @Get(":id/chunks")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Get document chunks",
    description: `
      Retrieves chunks for a document with pagination and ACL check.
      
      **Access Control:**
      - Returns 403 if user does not belong to any of the document's ACL groups
      - Returns 404 if document does not exist
      
      **Pagination:**
      - page: Page number (1-indexed, default: 1)
      - limit: Items per page (default: 20)
    `,
  })
  @ApiParam({
    name: "id",
    type: String,
    description: "Document ID",
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
    description: "Chunks retrieved successfully",
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean", example: true },
        message: { type: "string", example: "Chunks retrieved successfully" },
        data: {
          type: "object",
          properties: {
            chunks: {
              type: "array",
              items: { $ref: "#/components/schemas/ChunkResponseDto" },
            },
            total: { type: "number", example: 100 },
            page: { type: "number", example: 1 },
            limit: { type: "number", example: 20 },
            totalPages: { type: "number", example: 5 },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized - authentication required",
  })
  @ApiResponse({
    status: 403,
    description: "Forbidden - user does not have access to this document",
  })
  @ApiResponse({
    status: 404,
    description: "Document not found",
  })
  async getChunks(
    @CurrentUser("id") userId: string,
    @Param("id") id: string,
    @Query("page") page?: number,
    @Query("limit") limit?: number,
  ) {
    const result = await this.documentsService.getChunks(
      id,
      userId,
      page,
      limit,
    );
    return successResponse(result, "Chunks retrieved successfully");
  }

  @Get(":id/versions")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Get document versions",
    description: `
      Retrieves all versions for a document with ACL check.
      
      **Access Control:**
      - Returns 403 if user does not belong to any of the document's ACL groups
      - Returns 404 if document does not exist
    `,
  })
  @ApiParam({
    name: "id",
    type: String,
    description: "Document ID",
  })
  @ApiResponse({
    status: 200,
    description: "Versions retrieved successfully",
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean", example: true },
        message: { type: "string", example: "Versions retrieved successfully" },
        data: {
          type: "array",
          items: { $ref: "#/components/schemas/DocumentVersionResponseDto" },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized - authentication required",
  })
  @ApiResponse({
    status: 403,
    description: "Forbidden - user does not have access to this document",
  })
  @ApiResponse({
    status: 404,
    description: "Document not found",
  })
  async getVersions(
    @CurrentUser("id") userId: string,
    @Param("id") id: string,
  ) {
    const versions = await this.documentsService.getVersions(id, userId);
    return successResponse(versions, "Versions retrieved successfully");
  }

  @Get(":id/download")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Get document download URL",
    description: `
      Generates a temporary signed URL for downloading the original document file.
      
      **Access Control:**
      - Returns 403 if user does not have access to this document
      - Returns 404 if document does not exist
      
      **Response:**
      - Returns a signed URL valid for 1 hour
      - URL points to the original uploaded file
    `,
  })
  @ApiParam({
    name: "id",
    type: String,
    description: "Document ID",
  })
  @ApiResponse({
    status: 200,
    description: "Download URL generated successfully",
    schema: {
      type: "object",
      properties: {
        success: { type: "boolean", example: true },
        message: { type: "string", example: "Download URL generated successfully" },
        data: {
          type: "object",
          properties: {
            url: { type: "string", example: "https://..." },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: "Unauthorized - authentication required",
  })
  @ApiResponse({
    status: 403,
    description: "Forbidden - user does not have access to this document",
  })
  @ApiResponse({
    status: 404,
    description: "Document not found",
  })
  async getDownloadUrl(
    @CurrentUser("id") userId: string,
    @Param("id") id: string,
  ) {
    const result = await this.documentsService.getDownloadUrl(id, userId);
    return successResponse(result, "Download URL generated successfully");
  }
}
