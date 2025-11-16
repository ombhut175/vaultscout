import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsOptional, IsArray, IsUUID } from "class-validator";

export class UpdateDocumentDto {
  @ApiProperty({
    description: "Document title",
    example: "Updated Legal Contract 2024",
    required: false,
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({
    description: "Tags for document categorization",
    example: ["contract", "legal", "2024", "updated"],
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({
    description: "ACL group IDs for access control",
    example: ["550e8400-e29b-41d4-a716-446655440001"],
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsUUID("4", { each: true })
  aclGroups?: string[];
}
