import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateReviewDto } from './reviews.dto';
import { Review } from '@prisma/client';
import { AuthenticatedUser } from '../../common/interfaces/jwt-payload.interface';

@Injectable()
export class ReviewsService {
    constructor(private prisma: PrismaService) { }

    async create(createReviewDto: CreateReviewDto, user: AuthenticatedUser): Promise<Review> {
        return this.prisma.review.create({
            data: {
                content: createReviewDto.content,
                rating: createReviewDto.rating,
                authorId: user.userId,
                authorName: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Anonymous',
                authorRole: createReviewDto.authorRole,
                isApproved: false, // Moderation required
            },
        });
    }

    async findAllApproved(): Promise<Review[]> {
        return this.prisma.review.findMany({
            where: { isApproved: true },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findHomepageReviews(): Promise<Review[]> {
        return this.prisma.review.findMany({
            where: { isApproved: true, showOnHomepage: true },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findAllPending(): Promise<Review[]> {
        return this.prisma.review.findMany({
            where: { isApproved: false },
            orderBy: { createdAt: 'desc' },
        });
    }

    async toggleVisibility(id: string): Promise<Review> {
        const review = await this.prisma.review.findUnique({ where: { id } });
        if (!review) {
            throw new NotFoundException(`Review with ID ${id} not found`);
        }

        return this.prisma.review.update({
            where: { id },
            data: { isApproved: !review.isApproved },
        });
    }

    async toggleHomepageVisibility(id: string): Promise<Review> {
        const review = await this.prisma.review.findUnique({ where: { id } });
        if (!review) {
            throw new NotFoundException(`Review with ID ${id} not found`);
        }

        return this.prisma.review.update({
            where: { id },
            data: { showOnHomepage: !review.showOnHomepage },
        });
    }

    async delete(id: string): Promise<Review> {
        return this.prisma.review.delete({ where: { id } });
    }
}
