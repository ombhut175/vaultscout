# Redis Connection Management

## Problem
Every time the backend restarts, new Redis connections are created via BullMQ, but old connections aren't properly closed on the Redis cloud side. This causes connection limits to be reached.

## Solution

### 1. Enable NestJS Shutdown Hooks (Simple & Recommended)
Added **one line** in `src/main.ts`:

```typescript
app.enableShutdownHooks();
```

This single call:
- Listens for `SIGTERM` and `SIGINT` signals
- Automatically calls `onModuleDestroy()` lifecycle hooks on all providers
- Ensures BullMQ queues are properly closed before shutdown
- **No additional code needed!**

### 2. Queue Cleanup Service (Backup/Logging)
Added `QueueCleanupService` that implements NestJS `onModuleDestroy` lifecycle hook.

**File**: `src/modules/queues/services/queue-cleanup.service.ts`

This service:
- Closes all registered BullMQ queues gracefully
- Logs the cleanup process for monitoring
- Handles errors during cleanup
- **Automatically triggered** when shutdown hooks are enabled

### 3. Enhanced Connection Configuration
Updated BullMQ connection settings in `src/app.module.ts`:

```typescript
connection: {
  url: redisUrl,
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  enableOfflineQueue: false,
  connectTimeout: 10000,
  keepAlive: 30000,
  family: 4,
  retryStrategy: (times) => Math.min(times * 50, 2000),
  lazyConnect: false,              // NEW
  maxLoadingRetryTime: 10000,      // NEW
  enableAutoPipelining: true,       // NEW
  commandTimeout: 5000,             // NEW
}
```

These settings:
- `lazyConnect: false` - Connects immediately, not on first command
- `maxLoadingRetryTime` - Limits time spent retrying during initial load
- `enableAutoPipelining` - Optimizes command batching
- `commandTimeout` - Prevents hung commands from blocking connections

### 4. Connection Cleanup Script
Created a utility script to manually clean up orphaned Redis connections.

**File**: `scripts/cleanup-redis-connections.ts`

Features:
- Lists all current Redis connections
- Identifies idle connections (default threshold: 60 seconds)
- Kills orphaned/idle connections
- Shows before/after connection counts

## Usage

### Manual Cleanup
Run the cleanup script to remove orphaned connections:

```bash
npm run redis:cleanup
```

This will:
1. Connect to your Redis instance
2. List all current connections
3. Kill connections that have been idle for more than 60 seconds
4. Show summary of cleanup

### Automatic Cleanup on Shutdown
**Key Configuration**: `app.enableShutdownHooks()` in `src/main.ts:136`

When enabled, NestJS automatically:
- Listens for `SIGTERM` and `SIGINT` signals
- Calls `onModuleDestroy()` on all providers (including `QueueCleanupService`)
- Waits for async cleanup to complete before exiting
- Closes all BullMQ queue connections properly

To ensure proper cleanup:
- Press `Ctrl+C` **once** and wait for graceful shutdown
- Look for log: `"Starting graceful shutdown of BullMQ queues..."`
- Avoid force-killing the process (Ctrl+C twice)
- In production, use proper process managers (PM2, Docker) that send SIGTERM

## Monitoring

Check your Redis connection count:
1. Run `npm run redis:cleanup` - it will show total connections
2. Use Redis cloud dashboard to monitor connection metrics
3. Check application logs for queue cleanup messages

## Best Practices

1. **Always use graceful shutdown**
   - Don't force-kill the application
   - Wait for "All queues closed successfully" log message

2. **Monitor connection count**
   - Run cleanup script periodically if needed
   - Set up alerts in your Redis cloud dashboard

3. **Development workflow**
   - Stop backend properly before restarting
   - Clear orphaned connections weekly: `npm run redis:cleanup`

## Troubleshooting

### Connections still piling up
- Ensure the application is being stopped gracefully
- Check logs for "Starting graceful shutdown of BullMQ queues" message
- If missing, the lifecycle hook might not be firing

### Cleanup script errors
- Verify REDIS_URL in .env is correct
- Ensure Redis cloud allows CLIENT commands
- Check network connectivity to Redis

### Queue not closing
- Check for pending jobs blocking closure
- Review application logs for specific queue errors
- Consider draining queues before shutdown in production
