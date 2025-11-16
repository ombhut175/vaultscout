import { ApiProperty } from "@nestjs/swagger";

export class GroupResponseDto {
  @ApiProperty({
    description: "Group ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  id!: string;

  @ApiProperty({
    description: "Organization ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  orgId!: string;

  @ApiProperty({
    description: "Group name",
    example: "Engineering Team",
  })
  name!: string;

  @ApiProperty({
    description: "User ID who created the group",
    example: "123e4567-e89b-12d3-a456-426614174000",
    nullable: true,
  })
  createdBy!: string | null;

  @ApiProperty({
    description: "Group creation timestamp",
    example: "2024-01-01T00:00:00Z",
  })
  createdAt!: Date;

  @ApiProperty({
    description: "Number of members in the group",
    example: 5,
    required: false,
  })
  memberCount?: number;
}

export class GroupMemberDto {
  @ApiProperty({
    description: "User ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  userId!: string;

  @ApiProperty({
    description: "User email",
    example: "user@example.com",
    nullable: true,
  })
  email!: string | null;

  @ApiProperty({
    description: "Date when user joined the group",
    example: "2024-01-01T00:00:00Z",
  })
  joinedAt!: Date;
}

export class GroupWithMembersDto extends GroupResponseDto {
  @ApiProperty({
    description: "Group members",
    type: [GroupMemberDto],
  })
  members!: GroupMemberDto[];
}
