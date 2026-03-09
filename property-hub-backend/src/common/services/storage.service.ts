import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    S3Client,
    PutObjectCommand,
    DeleteObjectCommand,
    HeadBucketCommand,
    CreateBucketCommand,
    GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class StorageService implements OnModuleInit {
    private readonly logger = new Logger(StorageService.name);
    private s3Client: S3Client;
    private bucket: string;

    constructor(private configService: ConfigService) {
        const endpoint = this.configService.get<string>('S3_ENDPOINT');
        const accessKeyId = this.configService.get<string>('S3_ACCESS_KEY');
        const secretAccessKey = this.configService.get<string>('S3_SECRET_KEY');
        const region = this.configService.get<string>('S3_REGION') || 'us-east-1';

        // Ensure forcePathStyle is a boolean
        const fpsHeader = this.configService.get<string>('S3_FORCE_PATH_STYLE');
        const forcePathStyle = String(fpsHeader) === 'true';

        this.bucket = this.configService.get<string>('S3_BUCKET') || 'property-hub-documents';

        this.logger.log(`Initializing S3 client with endpoint: ${endpoint}, bucket: ${this.bucket}, region: ${region}, forcePathStyle: ${forcePathStyle}`);

        this.s3Client = new S3Client({
            endpoint,
            region,
            credentials: {
                accessKeyId,
                secretAccessKey,
            },
            forcePathStyle,
        });
    }

    async onModuleInit() {
        await this.ensureBucketExists();
    }

    private async ensureBucketExists() {
        try {
            await this.s3Client.send(new HeadBucketCommand({ Bucket: this.bucket }));
            this.logger.log(`Bucket "${this.bucket}" already exists.`);
        } catch (error: any) {
            if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
                this.logger.log(`Bucket "${this.bucket}" not found. Creating...`);
                try {
                    await this.s3Client.send(new CreateBucketCommand({ Bucket: this.bucket }));
                    this.logger.log(`Bucket "${this.bucket}" created successfully.`);
                } catch (createError) {
                    this.logger.error(`Error creating bucket "${this.bucket}":`, createError);
                }
            } else {
                this.logger.error(`Error checking bucket "${this.bucket}":`, error);
            }
        }
    }

    async uploadFile(
        file: any,
        key: string,
        contentType?: string,
    ): Promise<string> {
        try {
            const command = new PutObjectCommand({
                Bucket: this.bucket,
                Key: key,
                Body: file as any,
                ContentType: contentType,
            });

            await this.s3Client.send(command);
            this.logger.log(`Successfully uploaded file to: ${key}`);

            // Return a presigned URL for secure viewing (valid for 1 hour)
            return this.getDownloadUrl(key, 3600);
        } catch (error) {
            this.logger.error(`Failed to upload file to S3:`, error);
            throw error;
        }
    }

    async deleteFile(key: string): Promise<void> {
        try {
            const command = new DeleteObjectCommand({
                Bucket: this.bucket,
                Key: key,
            });

            await this.s3Client.send(command);
            this.logger.log(`Successfully deleted file: ${key}`);
        } catch (error) {
            this.logger.error(`Failed to delete file from S3:`, error);
            throw error;
        }
    }

    async getDownloadUrl(key: string, expiresInSeconds = 3600): Promise<string> {
        try {
            const command = new GetObjectCommand({
                Bucket: this.bucket,
                Key: key,
            });
            return await getSignedUrl(this.s3Client, command, { expiresIn: expiresInSeconds });
        } catch (error) {
            this.logger.error(`Failed to generate download URL:`, error);
            throw error;
        }
    }

    async getPresignedUrl(key: string, expiresInSeconds = 3600): Promise<string> {
        try {
            const command = new PutObjectCommand({
                Bucket: this.bucket,
                Key: key,
            });
            return await getSignedUrl(this.s3Client, command, { expiresIn: expiresInSeconds });
        } catch (error) {
            this.logger.error(`Failed to generate presigned upload URL:`, error);
            throw error;
        }
    }
}
