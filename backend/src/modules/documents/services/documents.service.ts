import { Injectable, Logger } from "@nestjs/common";
import { DocumentsRepository } from "../../../core/database/repositories/documents.repository";
import { ChunksRepository } from "../../../core/database/repositories/chunks.repository";
import { DocumentVersionsRepository } from "../../../core/database/repositories/document-versions.repository";
import { FilesRepository } from "../../../core/database/repositories/files.repository";
import { VectorIndexService } from "../../pinecone/services/vector-index.service";
import { SupabaseStorageService } from "../../../core/supabase/supabase-storage.service";
import { UpdateDocumentDto, DocumentFiltersDto } from "../dto";

@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name);

  constructor(
    private readonly documentsRepository: DocumentsRepository,
    private readonly chunksRepository: ChunksRepository,
    private readonly documentVersionsRepository: DocumentVersionsRepository,
    private readonly filesRepository: FilesRepository,
    private readonly vectorIndexService: VectorIndexService,
    private readonly storageService: SupabaseStorageService,
  ) {}

  //#region Find Operations

  /**
   * Find all documents with optional filters
   * Simplified for MVP - returns all documents
   * @param orgId Organization ID (optional)
   * @param userId User ID
   * @param filters Filters and pagination
   */
  async findAll(orgId: string | null | undefined, userId: string, filters: DocumentFiltersDto) {
    this.logger.log("Finding all documents", {
      operation: "findAll",
      orgId,
      userId,
      filters,
    });

    const { page = 1, limit = 20, status, fileType, tags } = filters;

    const result = await this.documentsRepository.findAccessibleToUser(
      userId,
      orgId,
      page,
      limit,
      { status, fileType, tags },
    );

    this.logger.log("Found documents", {
      operation: "findAll",
      count: result.documents.length,
      total: result.total,
    });

    return result;
  }

  /**
   * Find a single document by ID
   * @param id Document ID
   * @param userId User ID
   */
  async findOne(id: string, userId: string) {
    this.logger.log("Finding document by ID", {
      operation: "findOne",
      documentId: id,
      userId,
    });

    const document = await this.documentsRepository.findById(id);

    this.logger.log("Found document", {
      operation: "findOne",
      documentId: id,
    });

    return document;
  }

  //#endregion

  //#region Update Operations

  /**
   * Update document metadata
   * @param id Document ID
   * @param userId User ID
   * @param updateDto Update data
   */
  async update(id: string, userId: string, updateDto: UpdateDocumentDto) {
    this.logger.log("Updating document", {
      operation: "update",
      documentId: id,
      userId,
      updateDto,
    });

    await this.findOne(id, userId);

    const { title, tags } = updateDto;
    const metadata: { title?: string; tags?: string[] } = {};

    if (title !== undefined) {
      metadata.title = title;
    }
    if (tags !== undefined) {
      metadata.tags = tags;
    }

    let updatedDocument;
    if (Object.keys(metadata).length > 0) {
      updatedDocument = await this.documentsRepository.updateMetadata(
        id,
        metadata,
      );
    } else {
      updatedDocument = await this.documentsRepository.findById(id);
    }

    this.logger.log("Document updated successfully", {
      operation: "update",
      documentId: id,
    });

    return updatedDocument;
  }

  //#endregion

  //#region Delete Operations

  /**
   * Delete document with Pinecone cleanup
   * @param id Document ID
   * @param userId User ID
   */
  async delete(id: string, userId: string) {
    this.logger.log("Deleting document", {
      operation: "delete",
      documentId: id,
      userId,
    });

    const document = await this.findOne(id, userId);

    // Delete from database (cascade will handle chunks and embeddings)
    const { vectorIds } = await this.documentsRepository.deleteWithCascade(id);

    // Delete vectors from Pinecone
    if (vectorIds.length > 0) {
      try {
        const namespace = document.orgId ?? undefined;
        const ids = vectorIds.map((v) => v.vectorId);

        this.logger.log("Deleting vectors from Pinecone", {
          operation: "delete",
          documentId: id,
          namespace,
          vectorCount: ids.length,
        });

        await this.vectorIndexService.deleteVectors(ids, { namespace });

        this.logger.log("Vectors deleted from Pinecone", {
          operation: "delete",
          documentId: id,
          vectorCount: ids.length,
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        const errorStack = error instanceof Error ? error.stack : undefined;
        this.logger.error("Failed to delete vectors from Pinecone", {
          operation: "delete",
          documentId: id,
          error: errorMessage,
          stack: errorStack,
        });
        // Continue with deletion even if Pinecone cleanup fails
      }
    }

    this.logger.log("Document deleted successfully", {
      operation: "delete",
      documentId: id,
    });

    return { message: "Document deleted successfully" };
  }

  //#endregion

  //#region Chunks and Versions

  /**
   * Get chunks for a document with pagination
   * @param id Document ID
   * @param userId User ID
   * @param page Page number
   * @param limit Items per page
   */
  async getChunks(id: string, userId: string, page = 1, limit = 20) {
    this.logger.log("Getting document chunks", {
      operation: "getChunks",
      documentId: id,
      userId,
      page,
      limit,
    });

    await this.findOne(id, userId);

    // Get chunks with pagination
    const offset = (page - 1) * limit;
    const chunks = await this.chunksRepository.findByDocumentId(
      id,
      limit,
      offset,
    );

    // Get total count
    const total = await this.chunksRepository.countByDocumentId(id);

    this.logger.log("Found chunks", {
      operation: "getChunks",
      documentId: id,
      count: chunks.length,
      total,
    });

    return {
      chunks,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get versions for a document
   * @param id Document ID
   * @param userId User ID
   */
  async getVersions(id: string, userId: string) {
    this.logger.log("Getting document versions", {
      operation: "getVersions",
      documentId: id,
      userId,
    });

    await this.findOne(id, userId);

    // Get versions
    const versions = await this.documentVersionsRepository.findByDocumentId(id);

    this.logger.log("Found versions", {
      operation: "getVersions",
      documentId: id,
      count: versions.length,
    });

    return versions;
  }

  /**
   * Get download URL for a document
   * @param id Document ID
   * @param userId User ID
   * @returns Signed URL for downloading the document
   */
  async getDownloadUrl(id: string, userId: string): Promise<{ url: string }> {
    this.logger.log("Generating download URL", {
      operation: "getDownloadUrl",
      documentId: id,
      userId,
    });

    await this.findOne(id, userId);

    const files = await this.filesRepository.findByDocumentId(id);
    
    if (!files || files.length === 0) {
      throw new Error("No files found for this document");
    }

    const rawFile = files.find(f => f.bucket === "vs-raw-private");
    
    if (!rawFile) {
      throw new Error("Original file not found");
    }

    const signedUrl = await this.storageService.getSignedUrl(
      rawFile.bucket,
      rawFile.path,
      3600
    );

    this.logger.log("Download URL generated", {
      operation: "getDownloadUrl",
      documentId: id,
    });

    return { url: signedUrl };
  }

  //#endregion
}
