import { Controller, Post, Req, UseGuards, BadRequestException } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
// Removed unused multipart import causing compilation error
import { pipeline } from 'stream';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RequireRoles } from '../../common/decorators/require-roles.decorator';

const pump = promisify(pipeline);

@Controller('api/uploads')
@UseGuards(JwtAuthGuard)
export class UploadsController {

    @Post()
    @RequireRoles('property-partner', 'regional-manager', 'admin', 'central-authority')
    async uploadFile(@Req() req: FastifyRequest) {
        const parts = req.parts();
        let uploadedFileUrl = '';

        for await (const part of parts) {
            if (part.type === 'file') {
                const fileExtension = path.extname(part.filename).toLowerCase();
                const allowedExtensions = ['.mp4', '.mov', '.avi', '.mkv', '.webm'];

                if (!allowedExtensions.includes(fileExtension)) {
                    throw new BadRequestException('Invalid file type. Only video files are allowed.');
                }

                // Generate unique filename
                const randomName = crypto.randomBytes(16).toString('hex');
                const fileName = `${randomName}${fileExtension}`;
                const uploadDir = path.join(process.cwd(), 'uploads');

                // Ensure upload directory exists
                if (!fs.existsSync(uploadDir)) {
                    fs.mkdirSync(uploadDir, { recursive: true });
                }

                const filePath = path.join(uploadDir, fileName);

                // Save file
                await pump(part.file, fs.createWriteStream(filePath));

                // Construct URL
                const baseUrl = process.env.API_URL || 'http://localhost:3001';
                uploadedFileUrl = `${baseUrl}/uploads/${fileName}`;
            }
        }

        if (!uploadedFileUrl) {
            throw new BadRequestException('No file uploaded');
        }

        return { url: uploadedFileUrl };
    }
}
