import { Module } from "@nestjs/common";
import { DocumentsController } from "./documents.controller";
import {
  ChunkerService,
  DocumentProcessingService,
  TextExtractorService,
  DocumentsService,
} from "./services";
import { SupabaseModule } from "../../core/supabase/supabase.module";
import { PineconeModule } from "../pinecone/pinecone.module";
import { DatabaseModule } from "../../core/database/database.module";
import { QueuesModule } from "../queues/queues.module";
import { AuthGuard } from "../../common";

@Module({
  imports: [SupabaseModule, PineconeModule, DatabaseModule, QueuesModule],
  controllers: [DocumentsController],
  providers: [
    ChunkerService,
    DocumentProcessingService,
    TextExtractorService,
    DocumentsService,
    AuthGuard,
  ],
  exports: [
    ChunkerService,
    DocumentProcessingService,
    TextExtractorService,
    DocumentsService,
  ],
})
export class DocumentsModule {}
