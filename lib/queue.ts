// lib/queue.ts
// Make queue optional for environments without Redis/bullmq installed.
let Queue: any;
let Worker: any;
let RedisClient: any;
try {
  const bull = require('bullmq');
  Queue = bull.Queue;
  Worker = bull.Worker;
  RedisClient = require('ioredis');
} catch (err) {
  // queueing disabled in this environment
}
import { webhookHandlers } from './webhook-handlers';
import { prisma } from './prisma';
import { logError, logInfo } from './logger';

// Prefer explicit REDIS_URL, fallback to localhost (docker compose exposes port)
import { env } from './env';
const redisUrl = env.REDIS_URL || 'redis://localhost:6379';

let redisConnection: any = null;
export function getRedisConnection() {
  if (!RedisClient) return null;
  if (!redisConnection) {
    // ioredis must be configured with `maxRetriesPerRequest: null` for BullMQ compatibility
    redisConnection = new RedisClient(redisUrl, { maxRetriesPerRequest: null });
  }
  return redisConnection;
}

let _webhookQueue: any = null;
export function getWebhookQueue() {
  if (!_webhookQueue) {
    const conn = getRedisConnection();
    if (!Queue || !conn) return null;
    _webhookQueue = new Queue('webhooks', {
      connection: conn,
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: true
      }
    });
  }
  return _webhookQueue;
}

let _webhookWorker: any = null;
export function initWebhookWorker() {
  if (_webhookWorker) return _webhookWorker;
  const conn = getRedisConnection();
  if (!Worker || !conn) return null;

  _webhookWorker = new Worker(
    'webhooks',
    async (job: any) => {
      const { eventId, eventType, payload } = job.data;

      try {
        const handler = webhookHandlers[eventType];

        if (!handler) {
          logError(`No handler for event type: ${eventType}`);
          return;
        }

        const result = await handler(payload);

        await prisma.webhookEvent.update({
          where: { id: eventId },
          data: {
            status: 'completed',
            processedAt: new Date()
          }
        });

        logInfo(`Webhook ${eventId} processed successfully`);
        return result;

      } catch (error) {
        logError(`Error processing webhook ${eventId}:`, error);

        await prisma.webhookEvent.update({
          where: { id: eventId },
          data: {
            status: 'failed',
            errorMessage: error instanceof Error ? error.message : 'Unknown error'
          }
        });

        throw error;
      }
    },
    {
      connection: conn,
      concurrency: 5
    }
  );

  _webhookWorker.on('failed', (job: any, error: any) => {
    logError(`Job ${job?.id} failed:`, error);
  });

  return _webhookWorker;
}

export async function closeWebhookWorker() {
  try {
    if (_webhookWorker) {
      await _webhookWorker.close();
      _webhookWorker = null;
    }
    if (_webhookQueue) {
      await _webhookQueue.close();
      _webhookQueue = null;
    }
    if (redisConnection) {
      await redisConnection.quit();
      redisConnection = null;
    }
    logInfo('Webhook worker and queue closed');
  } catch (err) {
    logError('Error closing webhook worker/queue:', err);
  }
}