// lib/queue.ts
import { Queue, Worker } from 'bullmq';
import Redis from 'ioredis';
import { webhookHandlers } from './webhook-handlers';
import { prisma } from './prisma';
import { logError, logInfo } from './logger';

// Prefer explicit REDIS_URL, fallback to localhost (docker compose exposes port)
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

let redisConnection: Redis | null = null;
function getRedisConnection() {
  if (!redisConnection) {
    // ioredis must be configured with `maxRetriesPerRequest: null` for BullMQ compatibility
    redisConnection = new Redis(redisUrl, { maxRetriesPerRequest: null as any });
  }
  return redisConnection;
}

let _webhookQueue: Queue | null = null;
export function getWebhookQueue() {
  if (!_webhookQueue) {
    _webhookQueue = new Queue('webhooks', {
      connection: getRedisConnection(),
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: true
      }
    });
  }
  return _webhookQueue;
}

let _webhookWorker: Worker | null = null;
export function initWebhookWorker() {
  if (_webhookWorker) return _webhookWorker;

  _webhookWorker = new Worker(
    'webhooks',
    async (job) => {
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
      connection: getRedisConnection(),
      concurrency: 5
    }
  );

  _webhookWorker.on('failed', (job, error) => {
    logError(`Job ${job?.id} failed:`, error);
  });

  return _webhookWorker;
}