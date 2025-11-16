import { ApiProperty } from "@nestjs/swagger";

export class OrganizationResponseDto {
  @ApiProperty({
    description: "Organization ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  id!: string;

  @ApiProperty({
    description: "Organization name",
    example: "Acme Corporation",
  })
  name!: string;

  @ApiProperty({
    description: "Pinecone namespace for this organization",
    example: "acme-corporation",
  })
  pineconeNamespace!: string;

  @ApiProperty({
    description:
      "User role in organization (only present when fetching user's organizations)",
    example: "admin",
    required: false,
  })
  role?: "admin" | "editor" | "viewer";

  @ApiProperty({
    description: "User ID who created the organization",
    example: "123e4567-e89b-12d3-a456-426614174000",
    nullable: true,
  })
  createdBy!: string | null;

  @ApiProperty({
    description: "Organization creation timestamp",
    example: "2024-01-01T00:00:00.000Z",
  })
  createdAt!: Date;

  @ApiProperty({
    description:
      "When user joined the organization (only present when fetching user's organizations)",
    example: "2024-01-01T00:00:00.000Z",
    required: false,
  })
  joinedAt?: Date;
}
