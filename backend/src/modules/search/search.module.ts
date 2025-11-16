import { Module } from "@nestjs/common";
import { SearchController } from "./search.controller";
import { SearchService } from "./search.service";
import { DatabaseModule } from "../../core/database/database.module";
import { PineconeModule } from "../pinecone/pinecone.module";
import { SupabaseModule } from "../../core/supabase/supabase.module";
import { AuthGuard } from "../../common";

@Module({
  imports: [DatabaseModule, PineconeModule, SupabaseModule],
  controllers: [SearchController],
  providers: [SearchService, AuthGuard],
  exports: [SearchService],
})
export class SearchModule {}
