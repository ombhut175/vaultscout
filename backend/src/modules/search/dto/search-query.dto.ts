import { ApiProperty } from "@nestjs/swagger";
import {
  IsString,
  IsOptional,
  IsArray,
  IsInt,
  Min,
  Max,
  IsUUID,
} from "class-validator";
import { Type } from "class-transformer";

export class SearchQueryDto {
  @ApiProperty({
    description: "Search query text",
    example: "legal contract terms",
  })
  @IsString()
  query!: string;

  @ApiProperty({
    description: "Organization ID",
    example: "550e8400-e29b-41d4-a716-446655440000",
  })
  @IsUUID("4")
  orgId!: string;

  @ApiProperty({
    description: "Number of results to return",
    example: 10,
    required: false,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  topK?: number = 10;

  @ApiProperty({
    description: "Filter by file type",
    example: "pdf",
    required: false,
  })
  @IsOptional()
  @IsString()
  fileType?: string;

  @ApiProperty({
    description: "Filter by tags",
    example: ["contract", "legal"],
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
