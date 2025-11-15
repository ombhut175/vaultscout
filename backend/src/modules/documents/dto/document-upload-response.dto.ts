import { ApiProperty } from "@nestjs/swagger";

export class DocumentUploadResponseDto {
  @ApiProperty({
    description: "Document ID",
    example: "550e8400-e29b-41d4-a716-446655440000",
  })
  documentId!: string;

  @ApiProperty({
    description: "Background job ID for tracking processing status",
    example: "12345",
    required: false,
  })
  jobId?: string;

  @ApiProperty({
    description: "Version ID (populated after background processing completes)",
    example: "550e8400-e29b-41d4-a716-446655440001",
    required: false,
  })
  versionId?: string;

  @ApiProperty({
    description: "File ID (populated after background processing completes)",
    example: "550e8400-e29b-41d4-a716-446655440002",
    required: false,
  })
  fileId?: string;

  @ApiProperty({
    description: "Storage path in Supabase bucket (populated after background processing completes)",
    example:
      "550e8400-e29b-41d4-a716-446655440000/550e8400-e29b-41d4-a716-446655440001/document.pdf",
    required: false,
  })
  storagePath?: string;

  @ApiProperty({
    description: "Number of text chunks created (populated after background processing completes)",
    example: 42,
    required: false,
  })
  chunksCreated?: number;

  @ApiProperty({
    description: "Number of vectors upserted to Pinecone (populated after background processing completes)",
    example: 42,
    required: false,
  })
  vectorsUpserted?: number;

  @ApiProperty({
    description: "Document processing status",
    example: "queued",
    enum: ["queued", "processing", "ready", "error"],
  })
  status!: string;

  @ApiProperty({
    description: "Human-readable status message",
    example: "Document queued for processing",
    required: false,
  })
  message?: string;

  @ApiProperty({
    description: "Processing timestamp",
    example: "2024-11-15T09:05:31.040Z",
  })
  timestamp!: string;
}
