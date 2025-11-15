import { Injectable } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import { DocumentProcessingJobData } from "../processors/document-processing.processor";

@Injectable()
export class DocumentQueueService {
  constructor(
    @InjectQueue("document-processing")
    private readonly documentQueue: Queue,
  ) {}

  async processDocument(data: DocumentProcessingJobData): Promise<string> {
    const job = await this.documentQueue.add("process-document", data, {
      attempts: 3,
      backoff: {
        type: "exponential",
        delay: 5000,
      },
      removeOnComplete: {
        age: 86400,
      },
      removeOnFail: {
        age: 604800,
      },
    });

    if (!job.id) {
      throw new Error(
        "Failed to create document processing job - job ID not assigned",
      );
    }
    return job.id;
  }

  async getQueueStatus() {
    const counts = await this.documentQueue.getJobCounts();
    return {
      waiting: counts.waiting,
      active: counts.active,
      completed: counts.completed,
      failed: counts.failed,
      delayed: counts.delayed,
    };
  }

  async getJobStatus(jobId: string) {
    const job = await this.documentQueue.getJob(jobId);
    if (!job) {
      return null;
    }

    const state = await job.getState();
    return {
      id: job.id,
      state,
      progress: job.progress,
      data: job.data,
      failedReason: job.failedReason,
      finishedOn: job.finishedOn,
      processedOn: job.processedOn,
    };
  }
}
