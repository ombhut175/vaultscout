import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsArray, IsOptional, IsUUID } from "class-validator";

export class DocumentUploadDto {
  @ApiProperty({
    description: "Organization ID that owns the document",
    example: "550e8400-e29b-41d4-a716-446655440000",
  })
  @IsUUID()
  @IsNotEmpty()
  orgId!: string;

  @ApiProperty({
    description: "Document title",
    example: "Legal Contract 2024",
  })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({
    description: "File type/extension",
    example: "pdf",
  })
  @IsString()
  @IsNotEmpty()
  fileType!: string;

  @ApiProperty({
    description: "Tags for document categorization",
    example: ["contract", "legal", "2024"],
    required: false,
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @ApiProperty({
    description: "ACL group IDs for access control",
    example: ["550e8400-e29b-41d4-a716-446655440001"],
    required: false,
    type: [String],
  })
  @IsArray()
  @IsUUID("4", { each: true })
  @IsOptional()
  aclGroups?: string[];

  @ApiProperty({
    description: "Owner user ID",
    example: "550e8400-e29b-41d4-a716-446655440002",
    required: false,
  })
  @IsUUID()
  @IsOptional()
  ownerUserId?: string;

  @ApiProperty({
    description: "Version notes",
    example: "Initial upload",
    required: false,
  })
  @IsString()
  @IsOptional()
  notes?: string;
}
