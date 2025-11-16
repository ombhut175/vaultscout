import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsUUID } from "class-validator";

export class AddToOrganizationDto {
  @ApiProperty({
    description: "Organization ID",
    example: "123e4567-e89b-12d3-a456-426614174000",
  })
  @IsUUID()
  orgId!: string;

  @ApiProperty({
    description: "User role in the organization",
    enum: ["admin", "editor", "viewer"],
    example: "editor",
  })
  @IsEnum(["admin", "editor", "viewer"])
  role!: "admin" | "editor" | "viewer";
}
