import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
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
import { DocumentProcessingService } from "./services/document-processing.service";
import { DocumentUploadDto, DocumentUploadResponseDto } from "./dto";
import { MESSAGES } from "../../common/constants/string-const";
import { AuthGuard, CurrentUser } from "../../common";

@ApiTags("Documents")
@Controller("documents")
export class DocumentsController {
  private readonly maxFileSizeBytes = 50 * 1024 * 1024;
  private readonly minFileSizeBytes = 1;
  private readonly allowedMimeTypes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "text/markdown",
    "application/json",
    "application/octet-stream",
  ];
  private readonly allowedExtensions = [
    "pdf",
    "docx",
    "txt",
    "md",
    "markdown",
    "json",
  ];

  constructor(
    private readonly documentProcessingService: DocumentProcessingService,
  ) {}

  @Post("upload")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Upload and process document",
    description: `
      Uploads a document file to Supabase storage and processes it through the embedding pipeline.
      
      **Processing Steps:**
      1. Validate file type and size
      2. Upload raw file to vs-raw-private bucket
      3. Extract text from the document
      4. Save extracted text to vs-extracted-private bucket
      5. Chunk the text with overlap for context preservation
      6. Generate embeddings using HuggingFace BGE-large-en-v1.5 model (1024 dimensions)
      7. Upsert vectors to Pinecone with metadata
      8. Persist all metadata to PostgreSQL database
      
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
    if (!file) {
      throw new BadRequestException("File is required");
    }

    if (file.size < this.minFileSizeBytes) {
      throw new BadRequestException("File is empty or invalid");
    }

    if (file.size > this.maxFileSizeBytes) {
      throw new BadRequestException(
        `${MESSAGES.FILE_TOO_LARGE}: Maximum file size is ${this.maxFileSizeBytes / (1024 * 1024)}MB, received ${(file.size / (1024 * 1024)).toFixed(2)}MB`,
      );
    }

    const fileExtension = file.originalname
      .split(".")
      .pop()
      ?.toLowerCase();
    if (
      !fileExtension ||
      !this.allowedExtensions.includes(fileExtension)
    ) {
      throw new BadRequestException(
        `Invalid file type. Allowed extensions: ${this.allowedExtensions.join(", ")}`,
      );
    }

    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid MIME type. Allowed types: ${this.allowedMimeTypes.join(", ")}`,
      );
    }

    if (uploadDto.tags && typeof uploadDto.tags === "string") {
      const tagsStr = uploadDto.tags as string;
      if (tagsStr.trim().startsWith("[")) {
        uploadDto.tags = JSON.parse(tagsStr);
      } else {
        uploadDto.tags = tagsStr
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t.length > 0);
      }
    }

    if (uploadDto.aclGroups && typeof uploadDto.aclGroups === "string") {
      const aclStr = uploadDto.aclGroups as string;
      if (aclStr.trim().startsWith("[")) {
        uploadDto.aclGroups = JSON.parse(aclStr);
      } else {
        uploadDto.aclGroups = aclStr
          .split(",")
          .map((g) => g.trim())
          .filter((g) => g.length > 0);
      }
    }

    return this.documentProcessingService.uploadAndProcess(
      uploadDto,
      file,
      userId,
    );
  }
}
