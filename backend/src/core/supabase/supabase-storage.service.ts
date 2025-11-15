import { Injectable, Logger } from "@nestjs/common";
import { SupabaseClient } from "@supabase/supabase-js";
import { SupabaseService } from "./supabase.service";
import { SUPABASE_BUCKETS, MESSAGES } from "../../common/constants/string-const";

interface UploadResult {
  path: string;
  sizeBytes: number;
  mimeType: string;
}

@Injectable()
export class SupabaseStorageService {
  private readonly logger = new Logger(SupabaseStorageService.name);
  private serviceClient: SupabaseClient;

  constructor(private readonly supabaseService: SupabaseService) {
    this.serviceClient = this.supabaseService.getServiceRoleClient();
    this.logger.log("SupabaseStorageService initialized with service role client");
  }

  async uploadRaw(
    orgId: string,
    documentId: string,
    versionId: string,
    file: Express.Multer.File,
  ): Promise<UploadResult> {
    const path = `${orgId}/${documentId}/${versionId}/${file.originalname}`;

    this.logger.log("Uploading file to raw storage", {
      operation: "uploadRaw",
      bucket: SUPABASE_BUCKETS.RAW,
      path,
      size: file.size,
      mimeType: file.mimetype,
      timestamp: new Date().toISOString(),
    });

    try {
      const { data, error } = await this.serviceClient.storage
        .from(SUPABASE_BUCKETS.RAW)
        .upload(path, file.buffer, {
          contentType: file.mimetype,
          upsert: true,
        });

      if (error) {
        this.logger.error("Failed to upload file to storage", {
          operation: "uploadRaw",
          path,
          error: error.message,
        });
        throw new Error(`${MESSAGES.STORAGE_UPLOAD_ERROR}: ${error.message}`);
      }

      this.logger.log("File uploaded successfully", {
        operation: "uploadRaw",
        path: data.path,
        timestamp: new Date().toISOString(),
      });

      return {
        path: data.path,
        sizeBytes: file.size,
        mimeType: file.mimetype,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      this.logger.error("Upload operation failed", {
        operation: "uploadRaw",
        path,
        error: errorMessage,
      });
      throw error;
    }
  }

  async uploadExtracted(
    orgId: string,
    documentId: string,
    versionId: string,
    fileName: string,
    content: string,
  ): Promise<UploadResult> {
    const path = `${orgId}/${documentId}/${versionId}/${fileName}`;
    const buffer = Buffer.from(content, "utf8");

    this.logger.log("Uploading extracted text", {
      operation: "uploadExtracted",
      bucket: SUPABASE_BUCKETS.EXTRACTED,
      path,
      size: buffer.length,
      timestamp: new Date().toISOString(),
    });

    try {
      const { data, error } = await this.serviceClient.storage
        .from(SUPABASE_BUCKETS.EXTRACTED)
        .upload(path, buffer, {
          contentType: "text/plain",
          upsert: true,
        });

      if (error) {
        this.logger.error("Failed to upload extracted text", {
          operation: "uploadExtracted",
          path,
          error: error.message,
        });
        throw new Error(`${MESSAGES.STORAGE_UPLOAD_ERROR}: ${error.message}`);
      }

      this.logger.log("Extracted text uploaded successfully", {
        operation: "uploadExtracted",
        path: data.path,
        timestamp: new Date().toISOString(),
      });

      return {
        path: data.path,
        sizeBytes: buffer.length,
        mimeType: "text/plain",
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      this.logger.error("Upload extracted operation failed", {
        operation: "uploadExtracted",
        path,
        error: errorMessage,
      });
      throw error;
    }
  }

  async deleteFile(bucket: string, path: string): Promise<void> {
    this.logger.log("Deleting file from storage", {
      operation: "deleteFile",
      bucket,
      path,
      timestamp: new Date().toISOString(),
    });

    try {
      const { error } = await this.serviceClient.storage
        .from(bucket)
        .remove([path]);

      if (error) {
        this.logger.error("Failed to delete file", {
          operation: "deleteFile",
          bucket,
          path,
          error: error.message,
        });
        throw new Error(`Failed to delete file: ${error.message}`);
      }

      this.logger.log("File deleted successfully", {
        operation: "deleteFile",
        bucket,
        path,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      this.logger.error("Delete operation failed", {
        operation: "deleteFile",
        bucket,
        path,
        error: errorMessage,
      });
      throw error;
    }
  }

  async getPublicUrl(bucket: string, path: string): Promise<string> {
    const { data } = this.serviceClient.storage
      .from(bucket)
      .getPublicUrl(path);

    return data.publicUrl;
  }
}
