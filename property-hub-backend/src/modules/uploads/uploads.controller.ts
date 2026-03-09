import { Controller, Post, Get, Req, UseGuards, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import * as path from 'path';
import * as crypto from 'crypto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RequireRoles } from '../../common/decorators/require-roles.decorator';
import { StorageService } from '../../common/services/storage.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/interfaces/jwt-payload.interface';
import { UsersService } from '../users/users.service';
import { Public } from '../../common/decorators/public.decorator';

@Controller('api/uploads')
@UseGuards(JwtAuthGuard)
export class UploadsController {
    private static debugLogs: string[] = [];

    constructor(
        private readonly storageService: StorageService,
        private readonly usersService: UsersService
    ) { }

    @Get('debug-logs')
    @Public()
    getDebugLogs() {
        return UploadsController.debugLogs;
    }

    private log(msg: string) {
        console.log(msg);
        UploadsController.debugLogs.push(`${new Date().toISOString()} - ${msg}`);
        if (UploadsController.debugLogs.length > 100) UploadsController.debugLogs.shift();
    }

    @Post()
    @RequireRoles('property-partner', 'admin', 'central-authority', 'buyer', 'consultant')
    async uploadFile(
        @Req() req: FastifyRequest,
        @CurrentUser() user: AuthenticatedUser
    ) {
        this.log(`[UploadDebug] Started upload for user: ${user.userId}, roles: ${JSON.stringify(user.roles)}`);
        try {
            const parts = req.parts();
            let uploadedFileUrl = '';
            let category = '';
            let documentName = '';
            let fileBuffer: Buffer | null = null;
            let fileMimeType = '';
            let fileExtension = '';

            for await (const part of parts) {
                this.log(`[UploadDebug] Processing part: "${part.fieldname}", type: "${part.type}"`);

                if (part.type === 'file') {
                    this.log(`[UploadDebug] Found file: "${part.filename}", field: "${part.fieldname}"`);
                    fileExtension = path.extname(part.filename).toLowerCase();
                    const allowedExtensions = ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.jpg', '.jpeg', '.png', '.pdf'];

                    if (!allowedExtensions.includes(fileExtension)) {
                        this.log(`[UploadDebug] REJECTED: Invalid extension ${fileExtension}`);
                        throw new BadRequestException(`Invalid file type ${fileExtension}. Allowed: ${allowedExtensions.join(', ')}`);
                    }

                    fileMimeType = part.mimetype;
                    try {
                        fileBuffer = await part.toBuffer();
                        this.log(`[UploadDebug] Converted file to buffer, size: ${fileBuffer.length} bytes`);
                    } catch (err: any) {
                        this.log(`[UploadDebug] BUFFER_CONVERSION_ERROR: ${err.message}`);
                        throw new InternalServerErrorException(`Failed to process file stream: ${err.message}`);
                    }
                } else {
                    // It's a field
                    const fieldValue = (part as any).value?.toString();
                    this.log(`[UploadDebug] Found field: "${part.fieldname}", value: "${fieldValue}"`);

                    if (part.fieldname === 'category') category = fieldValue;
                    if (part.fieldname === 'name') documentName = fieldValue;
                }
            }

            if (!fileBuffer) {
                this.log('[UploadDebug] ERROR: No file buffer after loop');
                throw new BadRequestException('No file uploaded');
            }

            // Generate unique filename
            const randomName = crypto.randomBytes(16).toString('hex');
            const fileName = `${randomName}${fileExtension}`;

            // Upload to S3/MinIO
            uploadedFileUrl = await this.storageService.uploadFile(
                fileBuffer,
                fileName,
                fileMimeType
            );

            this.log(`[UploadDebug] File uploaded to storage: ${uploadedFileUrl}`);

            // If this is a buyer/consultant document, save to DB
            const userRoles = user.roles.map(r => r.toLowerCase());
            const isBuyer = userRoles.includes('buyer');
            const isConsultant = userRoles.includes('consultant');

            this.log(`[UploadDebug] Role check: isBuyer=${isBuyer}, isConsultant=${isConsultant}, category="${category}", name="${documentName}"`);

            if (isBuyer || isConsultant) {
                if (category && documentName) {
                    try {
                        this.log(`[UploadDebug] Attempting DB persistence for user ${user.userId}...`);
                        await this.usersService.saveUserDocument(
                            user.userId,
                            category,
                            documentName,
                            uploadedFileUrl
                        );
                        this.log(`[UploadDebug] DB persistence SUCCESS.`);
                    } catch (saveError: any) {
                        this.log(`[UploadDebug] DB persistence FAILED: ${saveError.message}`);
                    }
                } else {
                    this.log(`[UploadDebug] Skipping DB save: category or documentName is empty.`);
                }
            }

            return { url: uploadedFileUrl };
        } catch (error: any) {
            this.log(`[UploadDebug] SERVER_UPLOAD_ERROR: ${error.message}`);
            if (error instanceof BadRequestException || error instanceof InternalServerErrorException) {
                throw error;
            }
            throw new InternalServerErrorException(error.message || 'Unknown upload error');
        }
    }
}
