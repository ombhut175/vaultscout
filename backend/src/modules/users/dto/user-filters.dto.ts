import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsEnum, IsInt, Min, IsUUID } from "class-validator";
import { Type } from "class-transformer";

export class UserFiltersDto {
  @ApiProperty({
    description: "Organization ID to filter users",
    example: "123e4567-e89b-12d3-a456-426614174000",
    required: false,
  })
  @IsOptional()
  @IsUUID()
  orgId?: string;

  @ApiProperty({
    description: "Role filter",
    enum: ["admin", "editor", "viewer"],
    required: false,
  })
  @IsOptional()
  @IsEnum(["admin", "editor", "viewer"])
  role?: "admin" | "editor" | "viewer";

  @ApiProperty({
    description: "Page number for pagination",
    example: 1,
    default: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: "Number of items per page",
    example: 20,
    default: 20,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;
}
