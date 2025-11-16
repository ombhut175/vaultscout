import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsOptional } from "class-validator";

export class UpdateUserDto {
  @ApiProperty({
    description: "User email address",
    example: "user@example.com",
    required: false,
  })
  @IsOptional()
  @IsEmail()
  email?: string;
}
