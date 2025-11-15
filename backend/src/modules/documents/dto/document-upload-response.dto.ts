import { ApiProperty } from "@nestjs/swagger";

export class DocumentUploadResponseDto {
  @ApiProperty({
    description: "Document ID",
    example: "550e8400-e29b-41d4-a716-446655440000",
  })
  documentId!: string;

  @ApiProperty({
    description: "Version ID",
    example: "550e8400-e29b-41d4-a716-446655440001",
  })
  versionId!: string;

  @ApiProperty({
    description: "File ID",
    example: "550e8400-e29b-41d4-a716-446655440002",
  })
  fileId!: string;

  @ApiProperty({
    description: "Storage path in Supabase bucket",
    example: "550e8400-e29b-41d4-a716-446655440000/550e8400-e29b-41d4-a716-446655440001/document.pdf",
  })
  storagePath!: string;

  @ApiProperty({
    description: "Number of text chunks created",
    example: 42,
  })
  chunksCreated!: number;

  @ApiProperty({
    description: "Number of vectors upserted to Pinecone",
    example: 42,
  })
  vectorsUpserted!: number;

  @ApiProperty({
    description: "Document processing status",
    example: "ready",
    enum: ["queued", "processing", "ready", "error"],
  })
  status!: string;

  @ApiProperty({
    description: "Processing timestamp",
    example: "2024-11-15T09:05:31.040Z",
  })
  timestamp!: string;
}
