import { Module } from "@nestjs/common";
import { DocumentsController } from "./documents.controller";
import {
  ChunkerService,
  DocumentProcessingService,
  TextExtractorService,
} from "./services";
import { SupabaseModule } from "../../core/supabase/supabase.module";
import { PineconeModule } from "../pinecone/pinecone.module";
import { DatabaseModule } from "../../core/database/database.module";
import { AuthGuard } from "../../common";

@Module({
  imports: [SupabaseModule, PineconeModule, DatabaseModule],
  controllers: [DocumentsController],
  providers: [
    ChunkerService,
    DocumentProcessingService,
    TextExtractorService,
    AuthGuard,
  ],
  exports: [ChunkerService, DocumentProcessingService, TextExtractorService],
})
export class DocumentsModule {}
