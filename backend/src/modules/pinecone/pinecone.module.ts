import { Module } from "@nestjs/common";
import { PineconeController } from "./pinecone.controller";
import {
  SearchService,
  VectorIndexService,
  EmbeddingsService,
  IndexAdminService,
} from "./services";
import { HuggingfaceModule } from "../huggingface/huggingface.module";

@Module({
  imports: [HuggingfaceModule],
  controllers: [PineconeController],
  providers: [
    EmbeddingsService,
    VectorIndexService,
    SearchService,
    IndexAdminService,
  ],
  exports: [
    EmbeddingsService,
    VectorIndexService,
    SearchService,
    IndexAdminService,
  ],
})
export class PineconeModule {}
