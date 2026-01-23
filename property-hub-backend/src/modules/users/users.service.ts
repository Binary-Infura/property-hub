import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { UpdateUserMetadataDto } from './users.dto';
import { UserMetadata } from '@prisma/client';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async findOrCreateUserMetadata(keycloakId: string): Promise<UserMetadata> {
        let userMetadata = await this.prisma.userMetadata.findUnique({
            where: { keycloakId },
        });

        if (!userMetadata) {
            userMetadata = await this.prisma.userMetadata.create({
                data: { keycloakId },
            });
        }

        return userMetadata;
    }

    async updateUserMetadata(
        keycloakId: string,
        updateUserMetadataDto: UpdateUserMetadataDto,
    ): Promise<UserMetadata> {
        await this.findOrCreateUserMetadata(keycloakId);

        return this.prisma.userMetadata.update({
            where: { keycloakId },
            data: updateUserMetadataDto,
        });
    }

    async getUserMetadata(keycloakId: string): Promise<UserMetadata> {
        return this.findOrCreateUserMetadata(keycloakId);
    }
}
