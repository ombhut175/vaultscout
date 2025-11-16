import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString, IsArray, IsInt, Min } from "class-validator";
import { Type } from "class-transformer";

export class DocumentFiltersDto {
  @ApiProperty({
    description: "Filter by document status",
    example: "ready",
    required: false,
    enum: ["queued", "processing", "ready", "failed"],
  })
  @IsOptional()
  @IsString()
  status?: string;

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

  @ApiProperty({
    description: "Page number (1-indexed)",
    example: 1,
    required: false,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: "Items per page",
    example: 20,
    required: false,
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;
}
