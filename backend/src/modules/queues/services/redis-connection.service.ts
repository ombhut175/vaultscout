import { Injectable, Logger } from "@nestjs/common";
import { Redis } from "ioredis";

@Injectable()
export class RedisConnectionService {
  private readonly logger = new Logger(RedisConnectionService.name);

  setupConnectionListeners(redis: Redis): void {
    redis.on("connect", () => {
      this.logger.log("Redis connection established");
    });

    redis.on("ready", () => {
      this.logger.log("Redis is ready");
    });

    redis.on("error", (error) => {
      this.logger.error(`Redis error: ${error.message}`, error.stack);
    });

    redis.on("close", () => {
      this.logger.warn("Redis connection closed");
    });

    redis.on("reconnecting", () => {
      this.logger.warn("Redis is reconnecting...");
    });

    redis.on("end", () => {
      this.logger.warn("Redis connection ended");
    });
  }
}
