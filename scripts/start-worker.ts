// scripts/start-worker.ts
import { initWebhookWorker } from '../lib/queue';
import { logInfo } from '../lib/logger';

initWebhookWorker();
logInfo('Webhook worker started');

// Keep process alive
setInterval(() => {}, 1000 * 60 * 60);
