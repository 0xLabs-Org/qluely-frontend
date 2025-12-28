// scripts/start-worker.ts
import { initWebhookWorker, closeWebhookWorker } from '../lib/queue';
import { logInfo, logError } from '../lib/logger';

async function main() {
	initWebhookWorker();
	logInfo('Webhook worker started');

	// Graceful shutdown
	const shutdown = async () => {
		try {
			logInfo('Shutting down webhook worker...');
			await closeWebhookWorker();
			process.exit(0);
		} catch (err) {
			logError('Shutdown error:', err);
			process.exit(1);
		}
	};

	process.on('SIGINT', shutdown);
	process.on('SIGTERM', shutdown);
}

main().catch((err) => {
	logError('Worker failed to start:', err);
	process.exit(1);
});
