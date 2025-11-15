import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bullmq";

import { EmailProcessor } from "./processors/email.processor";
import { WorkflowProcessor } from "./processors/workflow.processor";
import { EmailQueueEventsListener } from "./listeners/email-queue-events.listener";
import { WorkflowQueueEventsListener } from "./listeners/workflow-queue-events.listener";
import { EmailQueueService } from "./services/email-queue.service";
import { WorkflowQueueService } from "./services/workflow-queue.service";
import { QueueMonitoringService } from "./services/queue-monitoring.service";
import { QueuesController } from "./queues.controller";

@Module({
  imports: [
    BullModule.registerQueue(
      {
        name: "email",
      },
      {
        name: "workflow",
      },
    ),
  ],
  controllers: [QueuesController],
  providers: [
    EmailProcessor,
    WorkflowProcessor,
    EmailQueueEventsListener,
    WorkflowQueueEventsListener,
    EmailQueueService,
    WorkflowQueueService,
    QueueMonitoringService,
  ],
  exports: [EmailQueueService, WorkflowQueueService, QueueMonitoringService],
})
export class QueuesModule {}
