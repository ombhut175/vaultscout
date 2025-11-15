import {
  Controller,
  Post,
  Body,
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
} from "@nestjs/swagger";
import { DocumentUploadDto, DocumentUploadResponseDto } from "./dto";
import { AuthGuard, CurrentUser } from "../../common";
import { DocumentProcessingService } from "./services/document-processing.service";

@ApiTags("Documents")
@Controller("documents")
export class DocumentsController {
  constructor(
    private readonly documentProcessingService: DocumentProcessingService,
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
          description: "Document file to upload (extension extracted automatically)",
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
}
