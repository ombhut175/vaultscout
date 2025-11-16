import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";

import { EmailProcessor } from "./processors/email.processor";
import { WorkflowProcessor } from "./processors/workflow.processor";
import { DocumentProcessingProcessor } from "./processors/document-processing.processor";
import { EmailQueueEventsListener } from "./listeners/email-queue-events.listener";
import { WorkflowQueueEventsListener } from "./listeners/workflow-queue-events.listener";
import { EmailQueueService } from "./services/email-queue.service";
import { WorkflowQueueService } from "./services/workflow-queue.service";
import { DocumentQueueService } from "./services/document-queue.service";
import { QueueMonitoringService } from "./services/queue-monitoring.service";
import { QueueCleanupService } from "./services/queue-cleanup.service";
import { QueuesController } from "./queues.controller";
import { SupabaseModule } from "../../core/supabase/supabase.module";
import { PineconeModule } from "../pinecone/pinecone.module";
import { DatabaseModule } from "../../core/database/database.module";
import { ChunkerService, TextExtractorService } from "../documents/services";

@Module({
  imports: [
    BullModule.registerQueue(
      {
        name: "email",
      },
      {
        name: "workflow",
      },
      {
        name: "document-processing",
      },
    ),
    SupabaseModule,
    PineconeModule,
    DatabaseModule,
  ],
  controllers: [QueuesController],
  providers: [
    EmailProcessor,
    WorkflowProcessor,
    DocumentProcessingProcessor,
    EmailQueueEventsListener,
    WorkflowQueueEventsListener,
    EmailQueueService,
    WorkflowQueueService,
    DocumentQueueService,
    QueueMonitoringService,
    QueueCleanupService,
    ChunkerService,
    TextExtractorService,
  ],
  exports: [
    EmailQueueService,
    WorkflowQueueService,
    DocumentQueueService,
    QueueMonitoringService,
  ],
})
export class QueuesModule {}
