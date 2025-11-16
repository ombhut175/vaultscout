import { Injectable, OnModuleDestroy, Logger } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";

@Injectable()
export class QueueCleanupService implements OnModuleDestroy {
  private readonly logger = new Logger(QueueCleanupService.name);

  constructor(
    @InjectQueue("email") private emailQueue: Queue,
    @InjectQueue("workflow") private workflowQueue: Queue,
    @InjectQueue("document-processing")
    private documentProcessingQueue: Queue,
  ) {}

  async onModuleDestroy(): Promise<void> {
    this.logger.log("Starting graceful shutdown of BullMQ queues...");

    try {
      await Promise.all([
        this.closeQueue(this.emailQueue, "email"),
        this.closeQueue(this.workflowQueue, "workflow"),
        this.closeQueue(this.documentProcessingQueue, "document-processing"),
      ]);

      this.logger.log("All queues closed successfully");
    } catch (error) {
      this.logger.error(
        `Error during queue cleanup: ${error instanceof Error ? error.message : error}`,
      );
    }
  }

  async purgeAllQueues(): Promise<{
    email: number;
    workflow: number;
    documentProcessing: number;
  }> {
    this.logger.warn("Purging all queues - removing all jobs");

    try {
      const results = await Promise.all([
        this.purgeQueue(this.emailQueue, "email"),
        this.purgeQueue(this.workflowQueue, "workflow"),
        this.purgeQueue(this.documentProcessingQueue, "document-processing"),
      ]);

      this.logger.log("All queues purged successfully", {
        email: results[0],
        workflow: results[1],
        documentProcessing: results[2],
      });

      return {
        email: results[0],
        workflow: results[1],
        documentProcessing: results[2],
      };
    } catch (error) {
      this.logger.error(
        `Error purging queues: ${error instanceof Error ? error.message : error}`,
      );
      throw error;
    }
  }

  async flushRedis(): Promise<string> {
    this.logger.warn("Flushing entire Redis database");

    try {
      const client = await this.emailQueue.client;
      await client.flushdb();
      this.logger.log("Redis database flushed successfully");
      return "Redis database flushed";
    } catch (error) {
      this.logger.error(
        `Error flushing Redis: ${error instanceof Error ? error.message : error}`,
      );
      throw error;
    }
  }

  async cleanupAll(): Promise<{
    purged: {
      email: number;
      workflow: number;
      documentProcessing: number;
    };
    redis: string;
    timestamp: string;
  }> {
    this.logger.warn(
      "Nuclear cleanup: purging all queues and flushing Redis",
    );

    try {
      const purged = await this.purgeAllQueues();
      const redis = await this.flushRedis();

      const result = {
        purged,
        redis,
        timestamp: new Date().toISOString(),
      };

      this.logger.log("Complete cleanup finished", result);
      return result;
    } catch (error) {
      this.logger.error(
        `Error during complete cleanup: ${error instanceof Error ? error.message : error}`,
      );
      throw error;
    }
  }

  private async purgeQueue(queue: Queue, name: string): Promise<number> {
    try {
      const count = await queue.count();
      await queue.drain();
      this.logger.log(`Queue "${name}" drained (removed ${count} jobs)`);
      return count;
    } catch (error) {
      this.logger.error(
        `Failed to drain queue "${name}": ${error instanceof Error ? error.message : error}`,
      );
      throw error;
    }
  }

  private async closeQueue(queue: Queue, name: string): Promise<void> {
    try {
      await queue.close();
      this.logger.log(`Queue "${name}" closed successfully`);
    } catch (error) {
      this.logger.error(
        `Failed to close queue "${name}": ${error instanceof Error ? error.message : error}`,
      );
      throw error;
    }
  }
}
