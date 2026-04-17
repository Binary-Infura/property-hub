import { NextRequest, NextResponse } from 'next/server';
import { reraQueue } from '@/lib/queue/rera-queue';

export async function GET() {
    try {
        const [waiting, active, completed, failed, delayed] = await Promise.all([
            reraQueue.getWaitingCount(),
            reraQueue.getActiveCount(),
            reraQueue.getCompletedCount(),
            reraQueue.getFailedCount(),
            reraQueue.getDelayedCount(),
        ]);

        const workers = await reraQueue.getWorkers();

        return NextResponse.json({
            counts: {
                waiting,
                active,
                completed,
                failed,
                delayed,
            },
            workerCount: workers.length,
            isOnline: workers.length > 0
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
