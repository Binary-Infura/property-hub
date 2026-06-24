import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(req: NextRequest) {
    const fileName = req.nextUrl.searchParams.get('file');

    if (!fileName) {
        return NextResponse.json({ error: 'File name required' }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), 'storage', 'scrapes', fileName);

    if (!fs.existsSync(filePath)) {
        return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);

    return new NextResponse(fileBuffer, {
        headers: {
            'Content-Type': 'application/x-ndjson',
            'Content-Disposition': `attachment; filename="${fileName}"`,
        },
    });
}
