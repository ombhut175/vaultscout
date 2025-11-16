import { Module } from "@nestjs/common";
import { GroupsController } from "./groups.controller";
import { GroupsService } from "./groups.service";
import { DatabaseModule } from "../../core/database/database.module";
import { SupabaseModule } from "../../core/supabase/supabase.module";
import {
  GroupsRepository,
  UsersRepository,
} from "../../core/database/repositories";

@Module({
  imports: [DatabaseModule, SupabaseModule],
  controllers: [GroupsController],
  providers: [GroupsService, GroupsRepository, UsersRepository],
  exports: [GroupsService, GroupsRepository],
})
export class GroupsModule {}
