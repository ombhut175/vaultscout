import { Processor, WorkerHost, OnWorkerEvent } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { Logger } from "@nestjs/common";
import { ChunkerService } from "../../documents/services/chunker.service";
import { TextExtractorService } from "../../documents/services/text-extractor.service";
import { EmbeddingsService } from "../../pinecone/services/embeddings.service";
import { VectorIndexService } from "../../pinecone/services/vector-index.service";
import {
  DocumentsRepository,
  DocumentVersionsRepository,
  ChunksRepository,
  FilesRepository,
  EmbeddingsRepository,
} from "../../../core/database/repositories";
import { SupabaseStorageService } from "../../../core/supabase/supabase-storage.service";
import { ENV, SUPABASE_BUCKETS } from "../../../common/constants/string-const";

export interface DocumentProcessingJobData {
  documentId: string;
  orgId?: string;
  userId: string;
  title: string;
  tags: string[];
  aclGroups: string[];
  notes: string;
  fileBuffer: Buffer;
  originalFilename: string;
  mimeType: string;
  fileSize: number;
  contentHash: string;
}

@Processor("document-processing", {
  concurrency: 1,
  stalledInterval: 300000,
  maxStalledCount: 3,
  lockDuration: 600000,
  lockRenewTime: 150000,
})
export class DocumentProcessingProcessor extends WorkerHost {
  private readonly logger = new Logger(DocumentProcessingProcessor.name);
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
    super();
    this.embeddingModel =
      process.env[ENV.HF_EMBEDDING_MODEL] || "BAAI/bge-large-en-v1.5";
    this.embeddingDim = Number(process.env[ENV.EMBEDDING_DIMENSIONS] || 1024);
    this.pineconeIndexName =
      process.env[ENV.PINECONE_INDEX_NAME] || "vaultscout-bge-1024";
  }

  async process(job: Job<DocumentProcessingJobData>): Promise<void> {
    const { data } = job;
    const fileExtension =
      data.originalFilename.split(".").pop()?.toLowerCase() || "unknown";

    this.logger.log("Starting document processing", {
      jobId: job.id,
      documentId: data.documentId,
      orgId: data.orgId,
      fileType: fileExtension,
    });

    try {
      await this.documentsRepo.update(data.documentId, {
        status: "processing",
      });

      const version = await this.versionsRepo.create({
        documentId: data.documentId,
        version: 1,
        notes: data.notes || "Initial upload",
      });

      this.logger.log("Version record created", {
        versionId: version.id,
        version: version.version,
      });

      const file = {
        buffer: Buffer.from(data.fileBuffer),
        originalname: data.originalFilename,
        mimetype: data.mimeType,
        size: data.fileSize,
      } as Express.Multer.File;

      const uploadResult = await this.storageService.uploadRaw(
        data.orgId,
        data.documentId,
        version.id,
        file,
      );

      const fileRecord = await this.filesRepo.create({
        orgId: data.orgId,
        documentId: data.documentId,
        versionId: version.id,
        bucket: SUPABASE_BUCKETS.RAW,
        path: uploadResult.path,
        mimeType: uploadResult.mimeType,
        sizeBytes: uploadResult.sizeBytes,
        sha256: data.contentHash,
        isPublic: false,
        createdBy: data.userId,
      });

      this.logger.log("File record created", {
        fileId: fileRecord.id,
      });

      const extractedText = await this.textExtractorService.extractText(file);

      if (!extractedText || extractedText.trim().length === 0) {
        this.logger.error("Text extraction resulted in empty content", {
          documentId: data.documentId,
          fileName: data.originalFilename,
          mimeType: data.mimeType,
        });
        throw new Error(
          "Unable to extract text from document. The file may be scanned, encrypted, or contain only images.",
        );
      }

      await this.storageService.uploadExtracted(
        data.orgId,
        data.documentId,
        version.id,
        `${data.originalFilename}.txt`,
        extractedText,
      );

      const chunks = this.chunkerService.chunk(extractedText);

      const chunkRecords = await this.chunksRepo.createMany(
        chunks.map((chunk) => ({
          orgId: data.orgId,
          documentId: data.documentId,
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
            operation: "processDocument",
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
          operation: "processDocument",
        });
        throw new Error(errorMsg);
      }

      const vectorIds: string[] = [];
      const vectorMetadata: Record<string, unknown>[] = [];

      for (const chunkRecord of chunkRecords) {
        const vectorId = `chunk_${data.documentId}_${chunkRecord.position}`;
        vectorIds.push(vectorId);
        vectorMetadata.push({
          document_id: data.documentId,
          chunk_id: chunkRecord.id,
          chunk_position: chunkRecord.position,
          org_id: data.orgId,
          file_type: fileExtension,
          tags: data.tags || [],
          acl_groups: data.aclGroups || [],
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
          orgId: data.orgId,
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

      await this.documentsRepo.update(data.documentId, {
        status: "ready",
        fileType: fileExtension,
      });

      this.logger.log("Document processing complete", {
        jobId: job.id,
        documentId: data.documentId,
        status: "ready",
        fileType: fileExtension,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      this.logger.error("Document processing failed", {
        jobId: job.id,
        documentId: data.documentId,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });

      try {
        await this.documentsRepo.updateStatus(data.documentId, "error");
        this.logger.log("Document status updated to error", {
          documentId: data.documentId,
        });
      } catch (updateError) {
        this.logger.error("Failed to update document status to error", {
          documentId: data.documentId,
          error:
            updateError instanceof Error
              ? updateError.message
              : "Unknown error",
        });
      }

      throw error;
    }
  }

  @OnWorkerEvent("completed")
  onCompleted(job: Job<DocumentProcessingJobData>) {
    this.logger.log("Document processing job completed", {
      jobId: job.id,
      documentId: job.data.documentId,
    });
  }

  @OnWorkerEvent("failed")
  onFailed(job: Job<DocumentProcessingJobData> | undefined, err: Error) {
    if (job) {
      this.logger.error("Document processing job failed", {
        jobId: job.id,
        documentId: job.data.documentId,
        error: err.message,
      });
    }
  }

  @OnWorkerEvent("stalled")
  onStalled(jobId: string) {
    this.logger.warn("Document processing job stalled", {
      jobId,
    });
  }

  @OnWorkerEvent("error")
  onError(err: Error) {
    this.logger.error("Worker error", {
      error: err.message,
      stack: err.stack,
    });
  }
}
