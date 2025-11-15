import { Injectable, Logger, BadRequestException } from "@nestjs/common";
import { createHash } from "crypto";
import { SupabaseStorageService } from "../../../core/supabase/supabase-storage.service";
import { ChunkerService } from "./chunker.service";
import { TextExtractorService } from "./text-extractor.service";
import { EmbeddingsService } from "../../pinecone/services/embeddings.service";
import { VectorIndexService } from "../../pinecone/services/vector-index.service";
import {
  DocumentsRepository,
  DocumentVersionsRepository,
  ChunksRepository,
  FilesRepository,
  EmbeddingsRepository,
} from "../../../core/database/repositories";
import {
  MESSAGES,
  ENV,
  SUPABASE_BUCKETS,
} from "../../../common/constants/string-const";
import { DocumentUploadDto } from "../dto/document-upload.dto";
import { DocumentUploadResponseDto } from "../dto/document-upload-response.dto";

@Injectable()
export class DocumentProcessingService {
  private readonly logger = new Logger(DocumentProcessingService.name);
  private readonly embeddingModel: string;
  private readonly embeddingDim: number;
  private readonly pineconeIndexName: string;

  constructor(
    private readonly storageService: SupabaseStorageService,
    private readonly chunkerService: ChunkerService,
    private readonly textExtractorService: TextExtractorService,
    private readonly embeddingsService: EmbeddingsService,
    private readonly vectorIndexService: VectorIndexService,
    private readonly documentsRepo: DocumentsRepository,
    private readonly versionsRepo: DocumentVersionsRepository,
    private readonly chunksRepo: ChunksRepository,
    private readonly filesRepo: FilesRepository,
    private readonly embeddingsRepo: EmbeddingsRepository,
  ) {
    this.embeddingModel =
      process.env[ENV.HF_EMBEDDING_MODEL] || "BAAI/bge-large-en-v1.5";
    this.embeddingDim = Number(process.env[ENV.EMBEDDING_DIMENSIONS] || 1024);
    this.pineconeIndexName =
      process.env[ENV.PINECONE_INDEX_NAME] || "vaultscout-bge-1024";
  }

  async uploadAndProcess(
    uploadDto: DocumentUploadDto,
    file: Express.Multer.File,
    userId: string,
  ): Promise<DocumentUploadResponseDto> {
    const fileExtension =
      file.originalname.split(".").pop()?.toLowerCase() || "unknown";

    this.logger.log("Starting document upload and processing", {
      operation: "uploadAndProcess",
      orgId: uploadDto.orgId,
      title: uploadDto.title,
      fileType: fileExtension,
      fileSize: file.size,
      userId,
      timestamp: new Date().toISOString(),
    });

    let documentId: string | null = null;

    try {
      const contentHash = this.calculateFileHash(file.buffer);

      const document = await this.documentsRepo.create({
        orgId: uploadDto.orgId,
        createdBy: userId,
        title: uploadDto.title,
        fileType: "pending",
        tags: uploadDto.tags || [],
        status: "processing",
        aclGroups: uploadDto.aclGroups || [],
        contentHash,
      });

      documentId = document.id;

      this.logger.log("Document record created", {
        documentId: document.id,
      });

      const version = await this.versionsRepo.create({
        documentId: document.id,
        version: 1,
        notes: uploadDto.notes || "Initial upload",
      });

      this.logger.log("Version record created", {
        versionId: version.id,
        version: version.version,
      });

      const uploadResult = await this.storageService.uploadRaw(
        uploadDto.orgId,
        document.id,
        version.id,
        file,
      );

      const fileRecord = await this.filesRepo.create({
        orgId: uploadDto.orgId,
        documentId: document.id,
        versionId: version.id,
        bucket: SUPABASE_BUCKETS.RAW,
        path: uploadResult.path,
        mimeType: uploadResult.mimeType,
        sizeBytes: uploadResult.sizeBytes,
        sha256: contentHash,
        isPublic: false,
        createdBy: userId,
      });

      this.logger.log("File record created", {
        fileId: fileRecord.id,
      });

      const extractedText = await this.textExtractorService.extractText(file);

      if (!extractedText || extractedText.trim().length === 0) {
        this.logger.error("Text extraction resulted in empty content", {
          documentId: document.id,
          fileName: file.originalname,
          mimeType: file.mimetype,
        });
        throw new BadRequestException(
          "Unable to extract text from document. The file may be scanned, encrypted, or contain only images.",
        );
      }

      await this.storageService.uploadExtracted(
        uploadDto.orgId,
        document.id,
        version.id,
        `${file.originalname}.txt`,
        extractedText,
      );

      const chunks = this.chunkerService.chunk(extractedText);

      const chunkRecords = await this.chunksRepo.createMany(
        chunks.map((chunk) => ({
          orgId: uploadDto.orgId,
          documentId: document.id,
          versionId: version.id,
          sectionTitle: null,
          page: null,
          position: chunk.position,
          text: chunk.text,
          tokenCount: null,
          contentHash: chunk.contentHash,
        })),
      );

      this.logger.log("Chunks created in database", {
        chunksCount: chunkRecords.length,
      });

      const batchSize = 64;
      const allVectors: number[][] = [];
      const allEmbeddings: any[] = [];

      for (let i = 0; i < chunks.length; i += batchSize) {
        const batchChunks = chunks.slice(i, i + batchSize);
        const batchTexts = batchChunks.map((c) => c.text);

        this.logger.log("Embedding batch", {
          batchNumber: Math.floor(i / batchSize) + 1,
          batchSize: batchTexts.length,
        });

        const embedResults =
          await this.embeddingsService.embedPassages(batchTexts);

        if (embedResults.length !== batchTexts.length) {
          const errorMsg = `Embedding batch size mismatch: expected ${batchTexts.length}, got ${embedResults.length}`;
          this.logger.error(errorMsg, {
            operation: "uploadAndProcess",
            expected: batchTexts.length,
            actual: embedResults.length,
          });
          throw new Error(errorMsg);
        }

        for (const result of embedResults) {
          allVectors.push(result.embeddings);
          allEmbeddings.push(result);
        }
      }

      this.logger.log("All embeddings generated", {
        vectorsCount: allVectors.length,
      });

      if (allVectors.length !== chunkRecords.length) {
        const errorMsg = `Vector count mismatch: chunks=${chunkRecords.length}, vectors=${allVectors.length}`;
        this.logger.error(errorMsg, {
          operation: "uploadAndProcess",
        });
        throw new Error(errorMsg);
      }

      const vectorIds: string[] = [];
      const vectorMetadata: Record<string, unknown>[] = [];

      for (let i = 0; i < chunkRecords.length; i++) {
        const chunkRecord = chunkRecords[i];
        const vectorId = `chunk_${document.id}_${chunkRecord.position}`;
        vectorIds.push(vectorId);
        vectorMetadata.push({
          document_id: document.id,
          chunk_id: chunkRecord.id,
          chunk_position: chunkRecord.position,
          org_id: uploadDto.orgId,
          file_type: fileExtension,
          tags: uploadDto.tags || [],
          acl_groups: uploadDto.aclGroups || [],
        });
      }

      const pineconeMaxBatchSize = 1000;
      for (let i = 0; i < vectorIds.length; i += pineconeMaxBatchSize) {
        const batchVectorIds = vectorIds.slice(i, i + pineconeMaxBatchSize);
        const batchVectors = allVectors.slice(i, i + pineconeMaxBatchSize);
        const batchMetadata = vectorMetadata.slice(i, i + pineconeMaxBatchSize);

        this.logger.log("Upserting batch to Pinecone", {
          batchNumber: Math.floor(i / pineconeMaxBatchSize) + 1,
          batchSize: batchVectorIds.length,
        });

        await this.vectorIndexService.upsertChunks(
          batchVectorIds,
          batchVectors,
          batchMetadata,
        );
      }

      this.logger.log("All vectors upserted to Pinecone", {
        vectorsCount: vectorIds.length,
      });

      await this.embeddingsRepo.createMany(
        chunkRecords.map((chunkRecord, index) => ({
          orgId: uploadDto.orgId,
          chunkId: chunkRecord.id,
          vectorId: vectorIds[index],
          indexName: this.pineconeIndexName,
          namespace: "",
          modelName: this.embeddingModel,
          modelVersion: "v1.5",
          dim: this.embeddingDim,
        })),
      );

      this.logger.log("Embedding metadata persisted", {
        embeddingsCount: chunkRecords.length,
      });

      await this.documentsRepo.update(document.id, {
        status: "ready",
        fileType: fileExtension,
      });

      this.logger.log("Document processing complete", {
        documentId: document.id,
        status: "ready",
        fileType: fileExtension,
      });

      return {
        documentId: document.id,
        versionId: version.id,
        fileId: fileRecord.id,
        storagePath: uploadResult.path,
        chunksCreated: chunkRecords.length,
        vectorsUpserted: vectorIds.length,
        status: "ready",
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      this.logger.error("Document processing failed", {
        operation: "uploadAndProcess",
        documentId,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });

      if (documentId) {
        try {
          await this.documentsRepo.updateStatus(documentId, "error");
          this.logger.log("Document status updated to error", {
            documentId,
          });
        } catch (updateError) {
          this.logger.error("Failed to update document status to error", {
            documentId,
            error:
              updateError instanceof Error
                ? updateError.message
                : "Unknown error",
          });
        }
      }

      throw new BadRequestException(
        `${MESSAGES.DOCUMENT_PROCESSING_FAILED}: ${errorMessage}`,
      );
    }
  }

  private calculateFileHash(buffer: Buffer): string {
    return createHash("sha256").update(buffer).digest("hex");
  }
}
