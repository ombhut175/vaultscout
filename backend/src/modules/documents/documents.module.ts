import { Module } from "@nestjs/common";
import { DocumentsController } from "./documents.controller";
import { ChunkerService, DocumentProcessingService, TextExtractorService } from "./services";
import { SupabaseModule } from "../../core/supabase/supabase.module";
import { PineconeModule } from "../pinecone/pinecone.module";
import { DatabaseModule } from "../../core/database/database.module";

@Module({
  imports: [SupabaseModule, PineconeModule, DatabaseModule],
  controllers: [DocumentsController],
  providers: [ChunkerService, DocumentProcessingService, TextExtractorService],
  exports: [ChunkerService, DocumentProcessingService, TextExtractorService],
})
export class DocumentsModule {}
