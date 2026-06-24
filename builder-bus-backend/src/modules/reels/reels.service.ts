import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateReelDto, UpdateReelInstagramDto } from './reels.dto';
import { UserRole } from '../../common/enums/role.enum';
import { Prisma, Reel, InstagramStatus } from '@prisma/client';
import { AuthenticatedUser } from '../../common/interfaces/jwt-payload.interface';
import { UsersService } from '../users/users.service';
import { InstagramService } from '../instagram/instagram.service';
import { StorageService } from '../../common/services/storage.service';

@Injectable()
export class ReelsService {
    constructor(
        private prisma: PrismaService,
        private usersService: UsersService,
        private instagramService: InstagramService,
        private storageService: StorageService,
    ) { }

    private async applyPresignedUrls(reel: any) {
        if (!reel) return reel;

        if (reel.videoUrl && !reel.videoUrl.startsWith('http')) {
            try {
                reel.videoUrl = await this.storageService.getDownloadUrl(reel.videoUrl);
            } catch (e) { }
        }

        if (reel.thumbnailUrl && !reel.thumbnailUrl.startsWith('http')) {
            try {
                reel.thumbnailUrl = await this.storageService.getDownloadUrl(reel.thumbnailUrl);
            } catch (e) { }
        }

        return reel;
    }

    private extractKey(urlOrKey: string | undefined): string | undefined {
        if (!urlOrKey) return urlOrKey;
        if (!urlOrKey.startsWith('http')) return urlOrKey;

        try {
            const url = new URL(urlOrKey);
            const parts = url.pathname.split('/');
            if (parts.length > 2) {
                return parts.slice(2).join('/');
            }
        } catch (e) { }
        return urlOrKey;
    }

    async findAll(page = 1, limit = 8, projectId?: string): Promise<{ data: Reel[]; total: number; hasMore: boolean }> {
        const skip = (page - 1) * limit;

        const where: Prisma.ReelWhereInput = projectId ? { projectId } : {};

        const [data, total] = await this.prisma.$transaction([
            this.prisma.reel.findMany({
                where,
                skip,
                take: limit,
                include: {
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                        }
                    },
                    project: {
                        select: {
                            id: true,
                            name: true,
                        }
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
            }),
            this.prisma.reel.count({ where }),
        ]);

        const processedData = await Promise.all(data.map(r => this.applyPresignedUrls(r)));
        return { data: processedData, total, hasMore: skip + data.length < total };
    }

    async findByUser(userId: string): Promise<Reel[]> {
        const reels = await this.prisma.reel.findMany({
            where: { userId },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    }
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        return Promise.all(reels.map(r => this.applyPresignedUrls(r)));
    }

    async create(createReelDto: CreateReelDto, user: AuthenticatedUser): Promise<Reel> {
        const internalUser = await this.usersService.ensureUserSynced(user);

        // Get project details for caption generation
        const project = await this.prisma.project.findUnique({
            where: { id: createReelDto.projectId },
        });

        // Generate Instagram caption if not provided
        let instagramCaption = createReelDto.instagramCaption;
        if (!instagramCaption && (createReelDto.publishToOfficialInstagram || createReelDto.publishToPartnerInstagram)) {
            instagramCaption = this.generateInstagramCaption(project);
        }

        // Determine initial Instagram status
        let instagramStatus: InstagramStatus = 'PENDING';
        if (createReelDto.publishToOfficialInstagram && !createReelDto.publishToPartnerInstagram) {
            instagramStatus = 'PENDING_APPROVAL'; // Will need admin approval
        }

        const reel = await this.prisma.reel.create({
            data: {
                title: createReelDto.title,
                description: createReelDto.description,
                videoUrl: this.extractKey(createReelDto.videoUrl) as string,
                thumbnailUrl: this.extractKey(createReelDto.thumbnailUrl),
                userId: internalUser.id,
                projectId: createReelDto.projectId,
                publishToOfficialInstagram: createReelDto.publishToOfficialInstagram || false,
                publishToPartnerInstagram: createReelDto.publishToPartnerInstagram || false,
                instagramCaption,
                instagramStatus,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    }
                },
            },
        });

        // Trigger Instagram publishing workflow if enabled for partner's account
        // Trigger Instagram publishing asynchronously if partner Instagram toggle is enabled
        // Use the presigned URL for external publishing
        const reelWithUrls = await this.applyPresignedUrls({ ...reel });
        if (reel.publishToPartnerInstagram) {
            this.publishToPartnerInstagramAsync(reel.id, reelWithUrls.videoUrl, instagramCaption, internalUser.id);
        }

        return reelWithUrls;
    }

    /**
     * Async method to publish to partner Instagram without blocking reel creation
     */
    private async publishToPartnerInstagramAsync(
        reelId: string,
        videoUrl: string,
        caption: string,
        userId: string,
    ): Promise<void> {
        try {
            // Run asynchronously in the background
            setImmediate(async () => {
                try {
                    await this.instagramService.publishReelToPartnerAccount(
                        reelId,
                        videoUrl,
                        caption,
                        userId,
                    );
                    console.log(`Successfully published reel ${reelId} to partner Instagram`);
                } catch (error: any) {
                    console.error(`Failed to publish reel ${reelId} to partner Instagram:`, error.message);
                    // Error is already logged in database by InstagramService
                }
            });
        } catch (error: any) {
            console.error(`Error in async Instagram publishing:`, error.message);
        }
    }

    async remove(id: string, user: AuthenticatedUser): Promise<Reel> {
        const internalUser = await this.usersService.ensureUserSynced(user);
        const reel = await this.prisma.reel.findUnique({
            where: { id },
        });

        if (!reel) {
            throw new NotFoundException(`Reel with ID ${id} not found`);
        }

        if (reel.userId !== internalUser.id && !user.roles.includes(UserRole.CENTRAL_AUTHORITY)) {
            throw new ForbiddenException('You do not have permission to delete this reel');
        }

        return this.prisma.reel.delete({
            where: { id },
        });
    }

    async updateInstagramSettings(id: string, updateDto: UpdateReelInstagramDto, user: AuthenticatedUser): Promise<Reel> {
        const internalUser = await this.usersService.ensureUserSynced(user);
        const reel = await this.prisma.reel.findUnique({
            where: { id },
        });

        if (!reel) {
            throw new NotFoundException(`Reel with ID ${id} not found`);
        }

        if (reel.userId !== internalUser.id && !user.roles.includes(UserRole.CENTRAL_AUTHORITY)) {
            throw new ForbiddenException('You do not have permission to update this reel');
        }

        return this.prisma.reel.update({
            where: { id },
            data: {
                publishToOfficialInstagram: updateDto.publishToOfficialInstagram,
                publishToPartnerInstagram: updateDto.publishToPartnerInstagram,
                instagramCaption: updateDto.instagramCaption,
            },
        });
    }

    async getReelForModeration(id: string): Promise<Reel> {
        const reel = await this.prisma.reel.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                    }
                },
                project: true,
            },
        });

        if (!reel) {
            throw new NotFoundException(`Reel with ID ${id} not found`);
        }

        return this.applyPresignedUrls(reel);
    }

    async getPendingReelsForModeration(page = 1, limit = 10): Promise<{ data: Reel[]; total: number; hasMore: boolean }> {
        const skip = (page - 1) * limit;

        const [data, total] = await this.prisma.$transaction([
            this.prisma.reel.findMany({
                where: {
                    publishToOfficialInstagram: true,
                    instagramStatus: 'PENDING_APPROVAL',
                },
                skip,
                take: limit,
                include: {
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                        }
                    },
                    project: true,
                },
                orderBy: {
                    createdAt: 'asc',
                },
            }),
            this.prisma.reel.count({
                where: {
                    publishToOfficialInstagram: true,
                    instagramStatus: 'PENDING_APPROVAL',
                },
            }),
        ]);

        const processedData = await Promise.all(data.map(r => this.applyPresignedUrls(r)));
        return { data: processedData, total, hasMore: skip + data.length < total };
    }

    private generateInstagramCaption(project: any): string {
        if (!project) return '';

        const hashtags = ['#PropertyHub', '#RealEstate', '#PropertyInvesting', '#DreamHome', '#PropertyDeal', '#RealEstateMarket', '#PropertyPartner'];
        const hashtag = hashtags[Math.floor(Math.random() * hashtags.length)];

        return `✨ Check out this amazing property! 

📍 ${project.address || project.location}
💰 ${project.price ? `Price: ₹${project.price.toLocaleString()}` : ''}
🏠 ${project.bedrooms || 'N/A'} BHK | 📐 ${project.area || 'N/A'} sqft

🔗 Explore more on PropertyHub!

${hashtag}`;
    }
}
