import { ApiProperty } from "@nestjs/swagger";

export class OrganizationStatsDto {
  @ApiProperty({
    description: "Total number of users in the organization",
    example: 25,
  })
  usersCount!: number;

  @ApiProperty({
    description: "Total number of groups in the organization",
    example: 5,
  })
  groupsCount!: number;

  @ApiProperty({
    description: "Total number of documents in the organization",
    example: 150,
  })
  documentsCount!: number;

  @ApiProperty({
    description: "Total storage used in bytes",
    example: 1073741824,
  })
  storageUsed!: number;
}
