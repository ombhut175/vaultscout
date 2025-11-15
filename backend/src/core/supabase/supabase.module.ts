import { Module } from "@nestjs/common";
import { SupabaseService } from "./supabase.service";
import { SupabaseStorageService } from "./supabase-storage.service";
import { StorageController } from "./storage.controller";
import { DatabaseModule } from "../database/database.module";

@Module({
  imports: [DatabaseModule],
  controllers: [StorageController],
  providers: [SupabaseService, SupabaseStorageService],
  exports: [SupabaseService, SupabaseStorageService],
})
export class SupabaseModule {}
