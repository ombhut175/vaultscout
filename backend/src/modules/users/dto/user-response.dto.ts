import { ApiProperty } from "@nestjs/swagger";

export class UserResponseDto {
  @ApiProperty({
    description: "User ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  id!: string;

  @ApiProperty({
    description: "External user ID from auth provider",
    example: "auth0|123456789",
  })
  externalUserId!: string;

  @ApiProperty({
    description: "User email address",
    example: "user@example.com",
    nullable: true,
  })
  email!: string | null;

  @ApiProperty({
    description: "User creation timestamp",
    example: "2024-01-01T00:00:00Z",
  })
  createdAt!: Date;

  @ApiProperty({
    description: "User role in organization (when filtered by org)",
    enum: ["admin", "editor", "viewer"],
    required: false,
  })
  role?: "admin" | "editor" | "viewer";

  @ApiProperty({
    description: "Date when user joined organization (when filtered by org)",
    example: "2024-01-01T00:00:00Z",
    required: false,
  })
  joinedAt?: Date;
}

export class UserWithOrganizationsDto extends UserResponseDto {
  @ApiProperty({
    description: "User's organizations with roles",
    type: "array",
    items: {
      type: "object",
      properties: {
        id: { type: "string", example: "123e4567-e89b-12d3-a456-426614174000" },
        name: { type: "string", example: "Acme Corp" },
        role: { type: "string", enum: ["admin", "editor", "viewer"] },
        joinedAt: { type: "string", example: "2024-01-01T00:00:00Z" },
      },
    },
  })
  organizations!: {
    id: string;
    name: string;
    role: "admin" | "editor" | "viewer";
    joinedAt: Date;
  }[];
}

export class UserWithGroupsDto extends UserResponseDto {
  @ApiProperty({
    description: "User's groups",
    type: "array",
    items: {
      type: "object",
      properties: {
        id: { type: "string", example: "123e4567-e89b-12d3-a456-426614174000" },
        name: { type: "string", example: "Engineering" },
        orgId: {
          type: "string",
          example: "123e4567-e89b-12d3-a456-426614174000",
        },
      },
    },
  })
  groups!: {
    id: string;
    name: string;
    orgId: string;
  }[];
}

export class PaginatedUsersResponseDto {
  @ApiProperty({
    description: "List of users",
    type: [UserResponseDto],
  })
  users!: UserResponseDto[];

  @ApiProperty({
    description: "Total number of users",
    example: 100,
  })
  total!: number;

  @ApiProperty({
    description: "Current page number",
    example: 1,
  })
  page!: number;

  @ApiProperty({
    description: "Number of items per page",
    example: 20,
  })
  limit!: number;

  @ApiProperty({
    description: "Total number of pages",
    example: 5,
  })
  totalPages!: number;
}
