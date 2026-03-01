import { Queue } from 'bullmq';

export const redisOptions = {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6380', 10),
    maxRetriesPerRequest: null,
};

export const reraQueue = new Queue('rera-sync', {
    connection: redisOptions,
});
