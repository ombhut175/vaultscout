import { Injectable, Logger, BadRequestException } from "@nestjs/common";
import * as mammoth from "mammoth";
import pdfParse from "pdf-parse";
import fileType from "file-type";
import { MESSAGES } from "../../../common/constants/string-const";

@Injectable()
export class TextExtractorService {
  private readonly logger = new Logger(TextExtractorService.name);

  private async detectFileType(
    buffer: Buffer,
    filename?: string,
  ): Promise<{ ext?: string; mime?: string }> {
    const detected = await fileType.fromBuffer(buffer);
    const fileExt = filename?.includes(".") 
      ? filename.split(".").pop()?.toLowerCase() 
      : undefined;

    if (detected?.ext === "cfb" && fileExt === "docx") {
      return { 
        ext: "docx", 
        mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" 
      };
    }

    if (detected) {
      return { ext: detected.ext, mime: detected.mime };
    }

    if (fileExt) {
      return { ext: fileExt };
    }

    return {};
  }

  private async extractPdfText(buffer: Buffer): Promise<string> {
    const data = await pdfParse(buffer);

    if (!data.text || data.text.trim() === "") {
      this.logger.warn("PDF text extraction returned empty string - possibly scanned/image-only PDF or encrypted");
    }

    return data.text || "";
  }

  private async extractDocxText(buffer: Buffer): Promise<string> {
    const result = await mammoth.extractRawText({ buffer });
    return result.value ?? "";
  }

  async extractText(file: Express.Multer.File): Promise<string> {
    this.logger.log("Extracting text from file", {
      mimeType: file.mimetype,
      size: file.size,
    });

    const { mime, ext } = await this.detectFileType(file.buffer, file.originalname);

    if (mime === "application/pdf" || ext === "pdf") {
      try {
        const text = await this.extractPdfText(file.buffer);
        this.logger.log("PDF text extracted", {
          textLength: text.length,
        });
        return text;
      } catch (error) {
        this.logger.error("Failed to extract text from PDF", error);
        throw new BadRequestException(MESSAGES.TEXT_EXTRACTION_ERROR);
      }
    }

    if (
      mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      ext === "docx"
    ) {
      try {
        const text = await this.extractDocxText(file.buffer);
        this.logger.log("DOCX text extracted", {
          textLength: text.length,
        });
        return text;
      } catch (error) {
        this.logger.error("Failed to extract text from DOCX", error);
        throw new BadRequestException(MESSAGES.TEXT_EXTRACTION_ERROR);
      }
    }

    if (mime?.includes("text") || ext === "txt" || ext === "json") {
      return file.buffer.toString("utf8");
    }

    throw new BadRequestException(MESSAGES.INVALID_FILE_TYPE);
  }
}
