import { ApiProperty } from "@nestjs/swagger";

export class SearchHistoryItemDto {
  @ApiProperty({
    description: "Search log ID",
    example: "550e8400-e29b-41d4-a716-446655440005",
  })
  id!: string;

  @ApiProperty({
    description: "Search query text",
    example: "legal contract terms",
  })
  queryText!: string;

  @ApiProperty({
    description: "Filters applied",
    example: { fileType: "pdf", tags: ["contract"] },
    required: false,
  })
  filters?: Record<string, any>;

  @ApiProperty({
    description: "Number of results requested",
    example: 10,
  })
  topk!: number;

  @ApiProperty({
    description: "Search latency in milliseconds",
    example: 150,
  })
  latencyMs!: number;

  @ApiProperty({
    description: "IDs of matched chunks",
    example: ["chunk-id-1", "chunk-id-2"],
    type: [String],
  })
  matchIds!: string[];

  @ApiProperty({
    description: "Search timestamp",
    example: "2024-01-01T00:00:00Z",
  })
  createdAt!: Date;
}

export class SearchHistoryResponseDto {
  @ApiProperty({
    description: "Search history items",
    type: [SearchHistoryItemDto],
  })
  history!: SearchHistoryItemDto[];

  @ApiProperty({
    description: "Total number of searches",
    example: 50,
  })
  total!: number;
}

export class SearchSuggestionDto {
  @ApiProperty({
    description: "Suggested query text",
    example: "legal contract terms",
  })
  query!: string;

  @ApiProperty({
    description: "Number of times this query was searched",
    example: 5,
  })
  count!: number;

  @ApiProperty({
    description: "Last search timestamp",
    example: "2024-01-01T00:00:00Z",
  })
  lastSearched!: Date;
}

export class SearchSuggestionsResponseDto {
  @ApiProperty({
    description: "Search suggestions",
    type: [SearchSuggestionDto],
  })
  suggestions!: SearchSuggestionDto[];
}
