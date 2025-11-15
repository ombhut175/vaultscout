export interface EmbeddingMetadata {
  dimensions: number;
  magnitude: number;
  normalized: boolean;
}

export function normalizeEmbedding(embedding: number[]): {
  normalized: number[];
  magnitude: number;
} {
  let magnitude = 0;

  for (const value of embedding) {
    magnitude += value * value;
  }

  magnitude = Math.sqrt(magnitude);

  if (magnitude === 0) {
    return {
      normalized: embedding,
      magnitude: 0,
    };
  }

  const normalized = embedding.map((value) => value / magnitude);

  return {
    normalized,
    magnitude,
  };
}

export function getEmbeddingMetadata(
  embedding: number[],
  normalized: boolean,
): EmbeddingMetadata {
  const magnitude = Math.sqrt(
    embedding.reduce((sum, val) => sum + val * val, 0),
  );

  return {
    dimensions: embedding.length,
    magnitude,
    normalized,
  };
}

export function validateEmbeddingDimensions(
  embedding: number[],
  expectedDimensions?: number,
): boolean {
  if (!expectedDimensions) {
    return true;
  }

  return embedding.length === expectedDimensions;
}
