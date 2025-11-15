import {
  IsString,
  IsArray,
  IsNotEmpty,
  IsOptional,
  ArrayMaxSize,
} from "class-validator";

export class FetchVectorsDto {
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  @ArrayMaxSize(100, {
    message: "Maximum 100 vectors per fetch request (recommended)",
  })
  ids!: string[];

  @IsString()
  @IsOptional()
  namespace?: string;
}
