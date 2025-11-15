import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { DrizzleService } from "./drizzle.service";
import { UsersRepository } from "./repositories/users.repository";
import { HealthCheckingRepository } from "./repositories/health-checking.repository";
import { DocumentsRepository } from "./repositories/documents.repository";
import { DocumentAclGroupsRepository } from "./repositories/document-acl-groups.repository";
import { DocumentVersionsRepository } from "./repositories/document-versions.repository";
import { ChunksRepository } from "./repositories/chunks.repository";
import { FilesRepository } from "./repositories/files.repository";
import { EmbeddingsRepository } from "./repositories/embeddings.repository";

@Module({
  imports: [ConfigModule],
  providers: [
    DrizzleService,
    UsersRepository,
    HealthCheckingRepository,
    DocumentsRepository,
    DocumentAclGroupsRepository,
    DocumentVersionsRepository,
    ChunksRepository,
    FilesRepository,
    EmbeddingsRepository,
  ],
  exports: [
    DrizzleService,
    UsersRepository,
    HealthCheckingRepository,
    DocumentsRepository,
    DocumentAclGroupsRepository,
    DocumentVersionsRepository,
    ChunksRepository,
    FilesRepository,
    EmbeddingsRepository,
  ],
})
export class DatabaseModule {}
