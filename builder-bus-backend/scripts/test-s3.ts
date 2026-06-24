import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const config = {
    endpoint: process.env.S3_ENDPOINT,
    region: process.env.S3_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY || '',
        secretAccessKey: process.env.S3_SECRET_KEY || '',
    },
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
};

async function test() {
    console.log('Testing S3 Upload with config:', { ...config, secretAccessKey: '***' });
    const client = new S3Client(config);

    try {
        const result = await client.send(new PutObjectCommand({
            Bucket: process.env.S3_BUCKET || 'builder-bus-documents',
            Key: 'test-file.txt',
            Body: 'Hello Cloudflare R2!',
            ContentType: 'text/plain',
        }));
        console.log('Upload Success:', result.$metadata.httpStatusCode);
    } catch (err) {
        console.error('Upload Failed:', err);
    }
}

test();
