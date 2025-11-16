# Testing Redis Connection Cleanup

## Quick Test Procedure

### Step 1: Clean Up Existing Orphaned Connections
```bash
npm run redis:cleanup
```
Note the **current connection count**.

---

### Step 2: Start Backend
```bash
npm run start:dev
```

Wait for the app to fully start. You should see:
```
✅ Shutdown hooks enabled for graceful cleanup
✅ Application is running on: http://localhost:3000
```

---

### Step 3: Check Connections Increased
Open a **new terminal** and run:
```bash
npm run redis:cleanup
```

You should see **3-5 new connections** (BullMQ queues + app connection).

---

### Step 4: Stop Backend Gracefully
In the terminal running the backend:
1. Press **Ctrl+C ONCE** (don't press twice!)
2. Wait and watch for these logs:

```
Starting graceful shutdown of BullMQ queues...
Queue "email" closed successfully
Queue "workflow" closed successfully
Queue "document-processing" closed successfully
All queues closed successfully
```

---

### Step 5: Verify Connections Are Cleaned Up
Run again:
```bash
npm run redis:cleanup
```

**Expected Result:**
- Connection count should be **back to baseline** (or close to it)
- No new orphaned connections should remain

---

### Step 6: Repeat Test (Connection Leak Check)
Repeat Steps 2-5 **three times** and check:

```bash
# After 1st restart
npm run redis:cleanup
# Note connection count

# After 2nd restart  
npm run redis:cleanup
# Count should be similar

# After 3rd restart
npm run redis:cleanup
# Count should still be similar
```

**✅ PASS**: Connection count stays stable across restarts  
**❌ FAIL**: Connection count keeps increasing

---

## Advanced Monitoring

### Watch Connections in Real-Time

**Terminal 1** - Run backend:
```bash
npm run start:dev
```

**Terminal 2** - Monitor connections every 5 seconds:
```bash
# PowerShell
while ($true) { 
  npm run redis:cleanup
  Start-Sleep -Seconds 5 
}

# Or run manually every few seconds
```

**Terminal 3** - Stop/restart backend and watch Terminal 2

---

## What to Look For

### ✅ Success Indicators
- Log message: `"Shutdown hooks enabled for graceful cleanup"`
- Log message: `"Starting graceful shutdown of BullMQ queues..."`
- Log message: `"All queues closed successfully"`
- Connection count returns to baseline after shutdown
- Stable connection count across multiple restarts

### ❌ Failure Indicators
- No shutdown logs appear
- Connection count keeps increasing
- Timeout errors during shutdown
- Queues not closing properly

---

## Troubleshooting

### Issue: No shutdown logs appear
**Cause**: Shutdown hooks not triggering  
**Fix**: Ensure `app.enableShutdownHooks()` is in `main.ts:136`

### Issue: Connections still accumulating
**Cause**: Force killing process (Ctrl+C twice)  
**Fix**: Press Ctrl+C **once** and wait for graceful shutdown

### Issue: Queue close timeouts
**Cause**: Pending jobs blocking closure  
**Fix**: Drain queues before shutdown or increase timeout

### Issue: Can't run cleanup script
**Cause**: Redis connection issues  
**Fix**: Check REDIS_URL in .env, verify network access

---

## Production Monitoring

In production, monitor:
1. Redis connection count metrics
2. Application shutdown logs
3. Queue closure success rate
4. Connection pool utilization

Set alerts for:
- Connection count exceeding threshold
- Failed queue closures
- Shutdown timeouts
