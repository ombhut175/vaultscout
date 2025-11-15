import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
  Max,
  IsObject,
} from "class-validator";

export class SearchQueryDto {
  @IsString()
  @IsNotEmpty()
  query!: string;

  @IsNumber()
  @Min(1)
  @Max(10000)
  @IsOptional()
  topK?: number;

  @IsObject()
  @IsOptional()
  filter?: Record<string, unknown>;

  @IsString()
  @IsOptional()
  namespace?: string;
}
