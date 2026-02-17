import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { REQUIRE_REGION_KEY } from '../../common/decorators/require-region.decorator';
import { IS_PUBLIC_KEY } from '../../common/decorators/public.decorator';
import { AuthenticatedUser } from '../../common/interfaces/jwt-payload.interface';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class RegionGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private prisma: PrismaService
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (isPublic) {
            return true;
        }

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
        const cityQuery = request.query.city;

        if (!user) {
            return false;
        }

        // 1. Check for global region access or roles that don't use region context
        const isGlobalRole = user.roles.some(role =>
            ['central-authority', 'property-partner', 'buyer', 'consultant', 'loan-adviser', 'marketing-manager', 'commission-manager', 'onboarding-manager', 'regional-manager', 'channel-partner', 'visit-executive', 'service-provider'].includes(role)
        );
        const regionGroup = `/regions/${regionSlug}`;

        if (isGlobalRole || (regionSlug && user.groups.includes(regionGroup))) {
            return true;
        }

        // 2. Check for city-level access (Onboarding Managers)
        if (cityQuery) {
            const citySlug = cityQuery.toLowerCase().replace(/\s+/g, '-');
            const cityGroup = `/cities/${citySlug}`;
            if (user.groups.includes(cityGroup)) {
                return true;
            }
        }

        if (!regionSlug || regionSlug === 'no-region') {
            // Already checked cityQuery, if we are here and no regionSlug, we can't proceed
            // unless we are CA, Partner or OM with a valid city group (already checked above)
            if (isGlobalRole) return true;

            // Re-check for internal city access just for the no-region case
            if (cityQuery) {
                const citySlug = cityQuery.toLowerCase().replace(/\s+/g, '-');
                if (user.groups.includes(`/cities/${citySlug}`)) return true;
            }

            throw new ForbiddenException('Region context is required or access denied for city');
        }

        // 3. Check for city-level access for the regionSlug (Onboarding Managers)
        const region = await this.prisma.region.findFirst({
            where: { code: regionSlug },
            include: { location: true }
        });

        if (region && region.location?.city) {
            const citySlug = region.location.city.toLowerCase().replace(/\s+/g, '-');
            const cityGroup = `/cities/${citySlug}`;

            if (user.groups.includes(cityGroup)) {
                return true;
            }
        }

        throw new ForbiddenException(`User does not have access to region: ${regionSlug}`);
    }
}
