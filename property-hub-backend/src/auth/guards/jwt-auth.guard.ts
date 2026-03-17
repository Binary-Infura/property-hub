import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../../common/decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    constructor(private reflector: Reflector) {
        super();
    }

    async canActivate(context: ExecutionContext) {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        try {
            // Attempt to validate the token
            const canActivate = await super.canActivate(context);
            if (canActivate) {
                return true;
            }
        } catch (error) {
            // If it's a public route, we don't care if the token is invalid or missing
            if (isPublic) {
                return true;
            }
            throw error;
        }

        return isPublic;
    }
}
