import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsUUID, MinLength, MaxLength } from "class-validator";

export class CreateGroupDto {
  @ApiProperty({
    description: "Organization ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsUUID()
  orgId!: string;

  @ApiProperty({
    description: "Group name",
    example: "Engineering Team",
    minLength: 1,
    maxLength: 100,
  })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name!: string;
}
