import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiResponse,
} from "@nestjs/swagger";
import { DocumentProcessingService } from "./services/document-processing.service";
import { DocumentUploadDto, DocumentUploadResponseDto } from "./dto";
import { MESSAGES } from "../../common/constants/string-const";

@ApiTags("Documents")
@Controller("documents")
export class DocumentsController {
  private readonly maxFileSizeBytes = 50 * 1024 * 1024;

  constructor(
    private readonly documentProcessingService: DocumentProcessingService,
  ) {}

  @Post("upload")
  @ApiOperation({
    summary: "Upload and process document",
    description: `
      Uploads a document file to Supabase storage and processes it through the embedding pipeline.
      
      **Processing Steps:**
      1. Upload raw file to vs-raw-private bucket
      2. Extract text from the document
      3. Save extracted text to vs-extracted-private bucket
      4. Chunk the text with overlap for context preservation
      5. Generate embeddings using HuggingFace BGE-large-en-v1.5 model (1024 dimensions)
      6. Upsert vectors to Pinecone with metadata
      7. Persist all metadata to PostgreSQL database
      
      **Supported File Types:**
      - Plain text files (.txt)
      - JSON files (.json)
      - PDF files (.pdf) - MVP supports text extraction only
      
      **Access Control:**
      - Documents are scoped to organizations (orgId required)
      - Optional ACL groups for fine-grained access control
      - Optional owner user ID for tracking ownership
    `,
  })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    description: "Document upload request with file and metadata",
    schema: <any>{
      type: "object",
      required: ["file", "orgId", "title", "fileType"],
      properties: {
        file: {
          type: "string",
          format: "binary",
          description: "Document file to upload",
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
        fileType: {
          type: "string",
          description: "File type/extension",
          example: "pdf",
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
        ownerUserId: {
          type: "string",
          format: "uuid",
          description: "Owner user ID",
          example: "550e8400-e29b-41d4-a716-446655440002",
        },
        notes: {
          type: "string",
          description: "Version notes",
          example: "Initial upload",
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: "Document uploaded and processed successfully",
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
        message: { type: "string", example: "Document processing failed: {error details}" },
        error: { type: "string", example: "Internal Server Error" },
      },
    },
  })
  @UseInterceptors(FileInterceptor("file"))
  async uploadDocument(
    @Body() uploadDto: DocumentUploadDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<DocumentUploadResponseDto> {
    if (!file) {
      throw new BadRequestException("File is required");
    }

    if (file.size > this.maxFileSizeBytes) {
      throw new BadRequestException(
        `${MESSAGES.FILE_TOO_LARGE}: Maximum file size is ${this.maxFileSizeBytes / (1024 * 1024)}MB, received ${(file.size / (1024 * 1024)).toFixed(2)}MB`,
      );
    }

    if (uploadDto.tags && typeof uploadDto.tags === "string") {
      const tagsStr = uploadDto.tags as string;
      if (tagsStr.trim().startsWith("[")) {
        uploadDto.tags = JSON.parse(tagsStr);
      } else {
        uploadDto.tags = tagsStr.split(",").map((t) => t.trim()).filter((t) => t.length > 0);
      }
    }

    if (uploadDto.aclGroups && typeof uploadDto.aclGroups === "string") {
      const aclStr = uploadDto.aclGroups as string;
      if (aclStr.trim().startsWith("[")) {
        uploadDto.aclGroups = JSON.parse(aclStr);
      } else {
        uploadDto.aclGroups = aclStr.split(",").map((g) => g.trim()).filter((g) => g.length > 0);
      }
    }

    return this.documentProcessingService.uploadAndProcess(uploadDto, file);
  }
}
