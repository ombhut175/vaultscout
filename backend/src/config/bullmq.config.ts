import { BullModule } from "@nestjs/bullmq";
import { BullBoardModule } from "@bull-board/nestjs";
import { ExpressAdapter } from "@bull-board/express";

const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

export const bullMQConfig = BullModule.forRoot({
  connection: {
    url: redisUrl,
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    enableOfflineQueue: false,
    commandTimeout: 300000,
  },
});

export const bullBoardConfig = BullBoardModule.forRoot({
  route: "/queues",
  adapter: ExpressAdapter,
});
