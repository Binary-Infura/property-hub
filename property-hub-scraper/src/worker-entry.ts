import { reraWorker } from './workers/rera-worker';

console.log('RERA Scraper Worker Service Started');

// Handle graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received. Shutting down...');
    await reraWorker.close();
    process.exit(0);
});
