import { NextRequest, NextResponse } from 'next/server';
import { reraQueue } from '@/lib/queue/rera-queue';

export async function POST(req: NextRequest) {
    try {
        const { state, district } = await req.json();

        if (!['maharashtra', 'rajasthan'].includes(state.toLowerCase())) {
            return NextResponse.json({ error: 'Unsupported state' }, { status: 400 });
        }

        console.log(`Adding job to queue for ${state}${district ? ` (${district})` : ''}`);
        const job = await reraQueue.add('sync-state', { state, district });

        return NextResponse.json({
            message: 'Scrape job queued',
            jobId: job.id,
            state,
            district
        });
    } catch (error: any) {
        console.error('Queueing error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
