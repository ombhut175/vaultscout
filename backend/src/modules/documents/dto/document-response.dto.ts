import { ApiProperty } from "@nestjs/swagger";

export class DocumentResponseDto {
  @ApiProperty({
    description: "Document ID",
    example: "550e8400-e29b-41d4-a716-446655440000",
  })
  id!: string;

  @ApiProperty({
    description: "Organization ID",
    example: "550e8400-e29b-41d4-a716-446655440001",
  })
  orgId!: string;

  @ApiProperty({
    description: "User ID who created the document",
    example: "550e8400-e29b-41d4-a716-446655440002",
  })
  createdBy!: string;

  @ApiProperty({
    description: "Email of user who created the document",
    example: "user@example.com",
    required: false,
  })
  createdByEmail?: string;

  @ApiProperty({
    description: "Document title",
    example: "Legal Contract 2024",
  })
  title!: string;

  @ApiProperty({
    description: "File type",
    example: "pdf",
  })
  fileType!: string;

  @ApiProperty({
    description: "Tags for categorization",
    example: ["contract", "legal", "2024"],
    type: [String],
  })
  tags!: string[];

  @ApiProperty({
    description: "Processing status",
    example: "ready",
    enum: ["queued", "processing", "ready", "failed"],
  })
  status!: string;

  @ApiProperty({
    description: "Content hash for deduplication",
    example: "abc123def456",
    required: false,
  })
  contentHash?: string;

  @ApiProperty({
    description: "Creation timestamp",
    example: "2024-01-01T00:00:00Z",
  })
  createdAt!: Date;

  @ApiProperty({
    description: "Last update timestamp",
    example: "2024-01-01T00:00:00Z",
  })
  updatedAt!: Date;
}

export class DocumentListResponseDto {
  @ApiProperty({
    description: "List of documents",
    type: [DocumentResponseDto],
  })
  documents!: DocumentResponseDto[];

  @ApiProperty({
    description: "Total number of documents",
    example: 100,
  })
  total!: number;

  @ApiProperty({
    description: "Current page number",
    example: 1,
  })
  page!: number;

  @ApiProperty({
    description: "Items per page",
    example: 20,
  })
  limit!: number;

  @ApiProperty({
    description: "Total number of pages",
    example: 5,
  })
  totalPages!: number;
}

export class ChunkResponseDto {
  @ApiProperty({
    description: "Chunk ID",
    example: "550e8400-e29b-41d4-a716-446655440003",
  })
  id!: string;

  @ApiProperty({
    description: "Position in document",
    example: 1,
  })
  position!: number;

  @ApiProperty({
    description: "Section title",
    example: "Introduction",
    required: false,
  })
  sectionTitle?: string;

  @ApiProperty({
    description: "Page number",
    example: 1,
    required: false,
  })
  page?: number;

  @ApiProperty({
    description: "Chunk text content",
    example: "This is the introduction section...",
  })
  text!: string;

  @ApiProperty({
    description: "Token count",
    example: 150,
  })
  tokenCount!: number;

  @ApiProperty({
    description: "Content hash",
    example: "xyz789abc123",
    required: false,
  })
  contentHash?: string;

  @ApiProperty({
    description: "Creation timestamp",
    example: "2024-01-01T00:00:00Z",
  })
  createdAt!: Date;

  @ApiProperty({
    description: "Embedding vector ID in Pinecone",
    example: "doc_550e8400_chunk_1",
    required: false,
  })
  embeddingId?: string;

  @ApiProperty({
    description: "Pinecone vector ID",
    example: "doc_550e8400_chunk_1",
    required: false,
  })
  vectorId?: string;

  @ApiProperty({
    description: "Pinecone namespace",
    example: "__default__",
    required: false,
  })
  namespace?: string;
}

export class DocumentVersionResponseDto {
  @ApiProperty({
    description: "Version ID",
    example: "550e8400-e29b-41d4-a716-446655440004",
  })
  id!: string;

  @ApiProperty({
    description: "Document ID",
    example: "550e8400-e29b-41d4-a716-446655440000",
  })
  documentId!: string;

  @ApiProperty({
    description: "Version number",
    example: 1,
  })
  version!: number;

  @ApiProperty({
    description: "Version notes",
    example: "Initial upload",
    required: false,
  })
  notes?: string;

  @ApiProperty({
    description: "Creation timestamp",
    example: "2024-01-01T00:00:00Z",
  })
  createdAt!: Date;
}
