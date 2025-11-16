import { Module } from "@nestjs/common";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";
import { DatabaseModule } from "../../core/database/database.module";
import { SupabaseModule } from "../../core/supabase/supabase.module";
import { UsersRepository } from "../../core/database/repositories";

@Module({
  imports: [DatabaseModule, SupabaseModule],
  controllers: [UsersController],
  providers: [UsersService, UsersRepository],
  exports: [UsersService, UsersRepository],
})
export class UsersModule {}
