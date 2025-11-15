import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsObject,
  MaxLength,
} from "class-validator";

export class StoreTextDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(10000)
  text!: string;

  @IsString()
  @IsOptional()
  id?: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, unknown>;

  @IsString()
  @IsOptional()
  namespace?: string;
}
