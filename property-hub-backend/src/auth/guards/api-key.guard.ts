import {
    Injectable,
    CanActivate,
    ExecutionContext,
    UnauthorizedException,
    Logger,
} from '@nestjs/common';
import { FastifyRequest } from 'fastify';

@Injectable()
export class ApiKeyGuard implements CanActivate {
    private readonly logger = new Logger(ApiKeyGuard.name);
    private readonly apiKey = process.env.N8N_WEBHOOK_API_KEY;

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest<FastifyRequest>();
        const apiKey = request.headers['x-api-key'] as string;

        if (!this.apiKey) {
            this.logger.error('N8N_WEBHOOK_API_KEY not configured');
            throw new UnauthorizedException('API key authentication not configured');
        }

        if (!apiKey) {
            this.logger.warn('Missing API key in request');
            throw new UnauthorizedException('Missing API key');
        }

        if (apiKey !== this.apiKey) {
            this.logger.warn(`Invalid API key attempt: ${apiKey.substring(0, 8)}...`);
            throw new UnauthorizedException('Invalid API key');
        }

        // this.logger.log('API key validated successfully');
        return true;
    }
}
