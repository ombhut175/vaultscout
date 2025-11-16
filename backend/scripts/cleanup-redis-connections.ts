import Redis from "ioredis";
import * as dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(__dirname, "../.env") });

interface RedisClient {
  id: string;
  addr: string;
  idle: string;
  name: string;
}

async function cleanupRedisConnections(): Promise<void> {
  const redisUrl = process.env.REDIS_URL || "redis://localhost:6379";

  console.log(`\n🔌 Connecting to Redis: ${redisUrl.replace(/\/\/.*@/, "//***@")}\n`);

  const redis = new Redis(redisUrl, {
    connectTimeout: 10000,
    lazyConnect: false,
  });

  try {
    const clientList = await redis.client("LIST");
    const clients = parseClientList(clientList);

    console.log(`📊 Total connected clients: ${clients.length}\n`);

    if (clients.length === 0) {
      console.log("✅ No clients connected. Nothing to clean up.\n");
      return;
    }

    console.log("📋 Current connections:");
    clients.forEach((client, index) => {
      console.log(
        `  ${index + 1}. ID: ${client.id}, Address: ${client.addr}, Idle: ${client.idle}s, Name: ${client.name || "N/A"}`,
      );
    });

    const idleThresholdSeconds = 60;
    const idleClients = clients.filter((c) => parseInt(c.idle) > idleThresholdSeconds);

    if (idleClients.length === 0) {
      console.log(`\n✅ No idle connections found (threshold: ${idleThresholdSeconds}s)\n`);
    } else {
      console.log(`\n🧹 Found ${idleClients.length} idle connections (idle > ${idleThresholdSeconds}s)`);
      console.log("\n⚠️  Killing idle connections...\n");

      for (const client of idleClients) {
        try {
          await redis.client("KILL", "ID", client.id);
          console.log(`  ✓ Killed client ID: ${client.id} (idle: ${client.idle}s)`);
        } catch (error) {
          console.error(
            `  ✗ Failed to kill client ID ${client.id}: ${error instanceof Error ? error.message : error}`,
          );
        }
      }

      console.log(`\n✅ Cleanup completed. Killed ${idleClients.length} idle connections.\n`);
    }

    const remainingClients = await redis.client("LIST");
    const remaining = parseClientList(remainingClients);
    console.log(`📊 Remaining connected clients: ${remaining.length}\n`);
  } catch (error) {
    console.error(
      `❌ Error during cleanup: ${error instanceof Error ? error.message : error}\n`,
    );
    throw error;
  } finally {
    await redis.quit();
    console.log("👋 Disconnected from Redis.\n");
  }
}

function parseClientList(clientListString: unknown): RedisClient[] {
  if (typeof clientListString !== "string") {
    return [];
  }

  const lines = clientListString.trim().split("\n");
  return lines.map((line) => {
    const parts = line.split(" ");
    const client: Partial<RedisClient> = {};

    parts.forEach((part) => {
      const [key, value] = part.split("=");
      if (key === "id") client.id = value;
      if (key === "addr") client.addr = value;
      if (key === "idle") client.idle = value;
      if (key === "name") client.name = value;
    });

    return client as RedisClient;
  });
}

cleanupRedisConnections()
  .then(() => {
    console.log("✨ Script completed successfully\n");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Script failed:", error);
    process.exit(1);
  });
