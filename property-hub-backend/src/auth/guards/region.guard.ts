import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { REQUIRE_REGION_KEY } from '../../common/decorators/require-region.decorator';
import { AuthenticatedUser } from '../../common/interfaces/jwt-payload.interface';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class RegionGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private prisma: PrismaService
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isRegionRequired = this.reflector.getAllAndOverride<boolean>(REQUIRE_REGION_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!isRegionRequired) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user: AuthenticatedUser = request.user;
        const regionSlug = request.params.regionSlug || request.params.region;

        if (!user) {
            return false;
        }

        if (!regionSlug) {
            throw new ForbiddenException('Region context is required but :region or :regionSlug param is missing');
        }

        // 1. Check for global region access or roles that don't use region context
        const isGlobalRole = user.roles.includes('central-authority') || user.roles.includes('property-partner');
        const regionGroup = `/regions/${regionSlug}`;
        if (isGlobalRole || user.groups.includes(regionGroup)) {
            return true;
        }

        // 2. Check for city-level access (Onboarding Managers)
        const region = await this.prisma.region.findFirst({
            where: { code: regionSlug }
        });

        if (region && region.city) {
            const citySlug = region.city.toLowerCase().replace(/\s+/g, '-');
            const cityGroup = `/cities/${citySlug}`;

            if (user.groups.includes(cityGroup)) {
                return true;
            }
        }

        throw new ForbiddenException(`User does not have access to region: ${regionSlug}`);
    }
}
