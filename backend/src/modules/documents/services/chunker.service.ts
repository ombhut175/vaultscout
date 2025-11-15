import { Injectable, Logger } from "@nestjs/common";
import { createHash } from "crypto";

export interface ChunkResult {
  text: string;
  position: number;
  contentHash: string;
}

interface ChunkOptions {
  chunkSize?: number;
  overlap?: number;
}

@Injectable()
export class ChunkerService {
  private readonly logger = new Logger(ChunkerService.name);
  private readonly defaultChunkSize = 1200;
  private readonly defaultOverlap = 150;

  normalize(text: string): string {
    return text.replace(/\s+/g, " ").trim();
  }

  hash(text: string): string {
    return createHash("sha256").update(text, "utf8").digest("hex");
  }

  chunk(text: string, options: ChunkOptions = {}): ChunkResult[] {
    const chunkSize = options.chunkSize || this.defaultChunkSize;
    const overlap = options.overlap || this.defaultOverlap;

    if (!text || typeof text !== "string") {
      throw new Error("Text must be a non-empty string");
    }

    if (text.trim().length === 0) {
      throw new Error("Text cannot be empty or whitespace only");
    }

    if (chunkSize <= 0 || overlap < 0) {
      throw new Error("Invalid chunk size or overlap values");
    }

    if (overlap >= chunkSize) {
      throw new Error("Overlap must be less than chunk size");
    }

    this.logger.log("Chunking text", {
      operation: "chunk",
      textLength: text.length,
      chunkSize,
      overlap,
      timestamp: new Date().toISOString(),
    });

    const chunks: ChunkResult[] = [];
    let position = 0;
    let i = 0;

    while (i < text.length) {
      const end = Math.min(i + chunkSize, text.length);
      const slice = text.slice(i, end);
      const normalized = this.normalize(slice);

      if (normalized.length > 0) {
        chunks.push({
          text: normalized,
          position: position++,
          contentHash: this.hash(normalized),
        });
      }

      i += chunkSize - overlap;
    }

    this.logger.log("Text chunked successfully", {
      operation: "chunk",
      chunksCreated: chunks.length,
      timestamp: new Date().toISOString(),
    });

    return chunks;
  }
}
