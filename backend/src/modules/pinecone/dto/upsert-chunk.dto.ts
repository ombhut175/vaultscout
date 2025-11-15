import {
  IsString,
  IsNotEmpty,
  IsArray,
  IsOptional,
  IsObject,
  ArrayMaxSize,
} from "class-validator";

export class UpsertChunkDto {
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  @ArrayMaxSize(1000, {
    message: "Maximum 1000 vectors per batch (Pinecone limit)",
  })
  ids!: string[];

  @IsArray()
  @IsNotEmpty()
  @ArrayMaxSize(1000, {
    message: "Maximum 1000 vectors per batch (Pinecone limit)",
  })
  vectors!: number[][];

  @IsArray()
  @IsObject({ each: true })
  @IsOptional()
  metadata?: Record<string, unknown>[];

  @IsString()
  @IsOptional()
  namespace?: string;
}
