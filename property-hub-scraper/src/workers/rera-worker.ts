import { Worker, Job } from 'bullmq';
import { redisOptions } from '../lib/queue/rera-queue';
import { MaharashtraScraper } from '../lib/scrapers/maharashtra.scraper';
import { RajasthanScraper } from '../lib/scrapers/rajasthan.scraper';
import fs from 'fs';
import path from 'path';

const scrapers = {
    maharashtra: new MaharashtraScraper(),
    rajasthan: new RajasthanScraper(),
};

export const reraWorker = new Worker('rera-sync', async (job: Job) => {
    console.log(`Processing job ${job.id} for state: ${job.data.state}`);

    const state = job.data.state.toLowerCase();
    const scraper = (scrapers as any)[state];

    if (!scraper) {
        throw new Error(`Scraper not found for state: ${state}`);
    }

    try {
        const projects = await scraper.scrape({ district: job.data.district });

        // Save to local storage (for NDJSON download)
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = `rera_${state}_${job.data.district || 'all'}_${timestamp}.ndjson`;
        const dirPath = path.join(process.cwd(), 'storage', 'scrapes');

        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }

        const filePath = path.join(dirPath, fileName);
        const ndjson = projects.map((p: any) => JSON.stringify(p)).join('\n');
        fs.writeFileSync(filePath, ndjson);

        console.log(`Job ${job.id} completed. Saved to ${fileName}`);

        return {
            success: true,
            count: projects.length,
            fileName,
            filePath
        };
    } catch (error: any) {
        console.error(`Job ${job.id} failed:`, error.message);
        throw error;
    }
}, {
    connection: redisOptions,
    concurrency: 1, // Government sites are sensitive to rate limits
});

reraWorker.on('completed', (job) => {
    console.log(`Job ${job.id} has completed!`);
});

reraWorker.on('failed', (job, err) => {
    console.error(`Job ${job?.id} has failed with ${err.message}`);
});
