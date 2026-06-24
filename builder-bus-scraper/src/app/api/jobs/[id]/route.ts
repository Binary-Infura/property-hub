import { NextRequest, NextResponse } from 'next/server';
import { reraQueue } from '@/lib/queue/rera-queue';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const job = await reraQueue.getJob(id);

        if (!job) {
            return NextResponse.json({ error: 'Job not found' }, { status: 404 });
        }

        const state = await job.getState();
        const progress = job.progress;
        const result = job.returnvalue;

        return NextResponse.json({
            id: job.id,
            state,
            progress,
            result,
            failedReason: job.failedReason,
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
