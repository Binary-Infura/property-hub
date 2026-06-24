import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './reviews.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthenticatedUser } from '../../common/interfaces/jwt-payload.interface';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { RequireRoles } from '../../common/decorators/require-roles.decorator';
import { UserRole } from '../../common/enums/role.enum';

@Controller('reviews')
export class ReviewsController {
    constructor(private readonly reviewsService: ReviewsService) { }

    @Get('approved')
    findAllApproved() {
        return this.reviewsService.findAllApproved();
    }

    @Get('homepage')
    findHomepageReviews() {
        return this.reviewsService.findHomepageReviews();
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    create(@Body() createReviewDto: CreateReviewDto, @CurrentUser() user: AuthenticatedUser) {
        return this.reviewsService.create(createReviewDto, user);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @RequireRoles(UserRole.CENTRAL_AUTHORITY)
    @Get('pending')
    findAllPending() {
        return this.reviewsService.findAllPending();
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @RequireRoles(UserRole.CENTRAL_AUTHORITY)
    @Patch(':id/toggle-visibility')
    toggleVisibility(@Param('id') id: string) {
        return this.reviewsService.toggleVisibility(id);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @RequireRoles(UserRole.CENTRAL_AUTHORITY)
    @Patch(':id/toggle-homepage')
    toggleHomepage(@Param('id') id: string) {
        return this.reviewsService.toggleHomepageVisibility(id);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @RequireRoles(UserRole.CENTRAL_AUTHORITY)
    @Delete(':id')
    delete(@Param('id') id: string) {
        return this.reviewsService.delete(id);
    }
}
