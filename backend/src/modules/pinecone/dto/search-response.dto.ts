export class SearchMatchDto {
  id!: string;
  score!: number;
  metadata?: Record<string, unknown>;
}

export class SearchResponseDto {
  matches!: SearchMatchDto[];
  namespace?: string;
  query?: string;
}
