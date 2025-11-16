import { Module } from "@nestjs/common";
import { OrganizationsController } from "./organizations.controller";
import { OrganizationsService } from "./organizations.service";
import { DatabaseModule } from "../../core/database/database.module";
import { SupabaseModule } from "../../core/supabase/supabase.module";
import { OrganizationsRepository } from "../../core/database/repositories";

@Module({
  imports: [DatabaseModule, SupabaseModule],
  controllers: [OrganizationsController],
  providers: [OrganizationsService, OrganizationsRepository],
  exports: [OrganizationsService, OrganizationsRepository],
})
export class OrganizationsModule {}
