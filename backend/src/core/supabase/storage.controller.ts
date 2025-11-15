import {
  Controller,
  Get,
  Param,
  Query,
  NotFoundException,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from "@nestjs/swagger";
import { SupabaseStorageService } from "./supabase-storage.service";
import { FilesRepository } from "../database/repositories/files.repository";

@ApiTags("Storage")
@Controller("storage")
export class StorageController {
  constructor(
    private readonly storageService: SupabaseStorageService,
    private readonly filesRepo: FilesRepository,
  ) {}

  @Get("files/:fileId/download-url")
  @ApiOperation({ summary: "Get signed download URL for a file" })
  @ApiParam({ name: "fileId", description: "File UUID" })
  @ApiQuery({
    name: "expiresIn",
    description: "URL expiration time in seconds (default: 3600)",
    required: false,
  })
  async getDownloadUrl(
    @Param("fileId") fileId: string,
    @Query("expiresIn") expiresIn?: number,
  ) {
    const file = await this.filesRepo.findById(fileId);

    if (!file) {
      throw new NotFoundException(`File with ID ${fileId} not found`);
    }

    const signedUrl = await this.storageService.getSignedUrl(
      file.bucket,
      file.path,
      expiresIn || 3600,
    );

    return {
      statusCode: 200,
      success: true,
      message: "Download URL generated successfully",
      data: {
        fileId: file.id,
        filename: file.path.split("/").pop(),
        bucket: file.bucket,
        mimeType: file.mimeType,
        sizeBytes: file.sizeBytes,
        downloadUrl: signedUrl,
        expiresIn: expiresIn || 3600,
      },
    };
  }
}
