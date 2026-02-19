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

        return true;
    }
}
