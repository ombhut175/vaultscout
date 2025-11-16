import { ApiProperty } from "@nestjs/swagger";
import { IsUUID } from "class-validator";

export class AddMemberDto {
  @ApiProperty({
    description: "User ID to add to the group",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsUUID()
  userId!: string;
}
