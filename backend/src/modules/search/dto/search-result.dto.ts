import { ApiProperty } from "@nestjs/swagger";

export class SearchResultDto {
  @ApiProperty({
    description: "Chunk ID",
    example: "550e8400-e29b-41d4-a716-446655440003",
  })
  chunkId!: string;

  @ApiProperty({
    description: "Document ID",
    example: "550e8400-e29b-41d4-a716-446655440000",
  })
  documentId!: string;

  @ApiProperty({
    description: "Document title",
    example: "Legal Contract 2024",
  })
  documentTitle!: string;

  @ApiProperty({
    description: "Chunk text content",
    example: "This is the introduction section...",
  })
  text!: string;

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
    description: "Position in document",
    example: 1,
  })
  position!: number;

  @ApiProperty({
    description: "Relevance score (0-1)",
    example: 0.85,
  })
  score!: number;

  @ApiProperty({
    description: "File type",
    example: "pdf",
  })
  fileType!: string;

  @ApiProperty({
    description: "Tags",
    example: ["contract", "legal"],
    type: [String],
  })
  tags!: string[];
}

export class SearchResponseDto {
  @ApiProperty({
    description: "Search results",
    type: [SearchResultDto],
  })
  results!: SearchResultDto[];

  @ApiProperty({
    description: "Total number of results",
    example: 10,
  })
  total!: number;

  @ApiProperty({
    description: "Search query",
    example: "legal contract terms",
  })
  query!: string;

  @ApiProperty({
    description: "Search latency in milliseconds",
    example: 150,
  })
  latencyMs!: number;
}
