import {
    Injectable, BadRequestException, NotFoundException,
    InternalServerErrorException, HttpException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import {
    UpdateUserPreferencesDto, CreateUserDto, UpdateUserDto,
    InviteUserDto, InviteCentralAuthorityDto, InvitationResponse, UpdateProfileDto
} from './users.dto';
import { User } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { AuthenticatedUser } from '../../common/interfaces/jwt-payload.interface';
import { UserRole } from '../../common/enums/role.enum';
import { OrganizationType } from '../../common/enums/organization-type.enum';
import * as bcrypt from 'bcrypt';

import { StorageService } from '../../common/services/storage.service';

@Injectable()
export class UsersService {
    constructor(
        private prisma: PrismaService,
        private configService: ConfigService,
        private activityLogsService: ActivityLogsService,
        private storageService: StorageService,
    ) { }

    private async hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password, 10);
    }

    // ─────────────────────────────────────────────────────────────
    // USER PREFERENCES (inline on User — replaces UserMetadata)
    // ─────────────────────────────────────────────────────────────

    async updateUserPreferences(userId: string, dto: UpdateUserPreferencesDto): Promise<User> {
        return this.prisma.user.update({
            where: { id: userId },
            data: {
                theme: dto.theme,
                notifications: dto.notifications as any,
                onboardingStatus: dto.onboardingStatus,
                language: dto.language,
                regionPreference: dto.regionPreference,
            },
        });
    }

    async getUserPreferences(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { language: true, theme: true, notifications: true, onboardingStatus: true, regionPreference: true },
        });
        if (!user) throw new NotFoundException('User not found');
        return user;
    }


    // ─────────────────────────────────────────────────────────────
    // AUTH SUPPORT
    // ─────────────────────────────────────────────────────────────

    async ensureUserSynced(authenticatedUser: AuthenticatedUser): Promise<User> {
        let user = await this.prisma.user.findUnique({ where: { id: authenticatedUser.userId } });

        if (!user && authenticatedUser.email) {
            user = await this.prisma.user.findUnique({ where: { email: authenticatedUser.email } });
        }

        if (user) return user;

        const rawRoles = authenticatedUser.roles || [];
        const normalizedRoles = rawRoles
            .filter(r => Object.values(UserRole).includes(r as any)) as UserRole[];

        const fallbackRoles = normalizedRoles.length > 0 ? normalizedRoles : [UserRole.BUYER];

        return this.prisma.user.create({
            data: {
                id: authenticatedUser.userId,
                email: authenticatedUser.email || 'unknown',
                firstName: authenticatedUser.firstName || authenticatedUser.username || 'System',
                lastName: authenticatedUser.lastName || 'User',
                roles: fallbackRoles as any[],
                activeRole: fallbackRoles[0] as any,
            },
        });
    }

    // ─────────────────────────────────────────────────────────────
    // USER MANAGEMENT
    // ─────────────────────────────────────────────────────────────

    async createUser(dto: CreateUserDto, currentUser?: AuthenticatedUser): Promise<User> {
        if (!dto.firstName) throw new BadRequestException('firstName must be provided');

        const passwordHash = await this.hashPassword(dto.password || 'password');

        let onboardedById: string | null = null;
        let inheritedOrganizationId: string | null = null;
        if (currentUser) {
            const internalUser = await this.prisma.user.findUnique({ 
                where: { id: currentUser.userId },
                select: { id: true, organizationId: true }
            });
            if (internalUser) {
                onboardedById = internalUser.id;
                inheritedOrganizationId = internalUser.organizationId;
            }
        }

        // Check if user already exists
        const existingUser = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });

        if (existingUser) {
            // Append new roles, ensuring uniqueness
            const updatedRoles = Array.from(new Set([...existingUser.roles, ...dto.roles]));
            const activeRole = dto.activeRole || dto.roles[0] || existingUser.activeRole;

            const updatedUser = await this.prisma.user.update({
                where: { id: existingUser.id },
                data: {
                    roles: updatedRoles as any[],
                    activeRole: activeRole as any,
                    // Optionally update other fields if they are missing or if we want to overwrite
                    phone: existingUser.phone || dto.phone,
                    firstName: existingUser.firstName || dto.firstName,
                    lastName: existingUser.lastName || dto.lastName,
                },
            });

            await this.activityLogsService.log({
                userId: onboardedById || updatedUser.id,
                type: 'info',
                action: 'User Roles Updated via Invitation',
                target: `${updatedUser.firstName} ${updatedUser.lastName || ''}`,
                details: { newRoles: dto.roles, allRoles: updatedUser.roles }
            });

            return updatedUser;
        }

        // Create/find organization if business info provided for specific roles
        let organizationId = dto.organizationId ?? null;
        const needsOrg = dto.roles.includes(UserRole.PROPERTY_PARTNER);
        const hasBusinessInfo = dto.companyName;

        if (needsOrg && hasBusinessInfo && !organizationId) {
            const orgType = OrganizationType.PROPERTY_PARTNER;
            const org = await this.prisma.organization.create({
                data: {
                    name: (dto.companyName || dto.agencyName) as string,
                    type: orgType as any,
                    address: dto.companyAddress || dto.officeAddress,
                    taxId: dto.taxId,
                    licenseNumber: dto.licenseNumber || dto.reraNumber,
                },
            });
            organizationId = org.id;
        }

        const createdUser = await this.prisma.user.create({
            data: {
                passwordHash,
                firstName: dto.firstName,
                lastName: dto.lastName,
                email: dto.email,
                phone: dto.phone,
                roles: dto.roles as any[],
                activeRole: (dto.activeRole ?? dto.roles[0] ?? undefined) as any,
                reraId: dto.reraId,
                organizationId: organizationId || inheritedOrganizationId,
                onboardedById,
                profileData: (dto.roles.includes(UserRole.BROKER as any)) ? {
                    agencyName: dto.agencyName,
                    officeAddress: dto.officeAddress,
                    reraNumber: dto.reraNumber || dto.reraId,
                    brokerType: dto.brokerType,
                } : undefined,
            },
        });

        await this.activityLogsService.log({
            userId: onboardedById || createdUser.id,
            type: 'info',
            action: 'User Registered',
            target: `${createdUser.firstName} ${createdUser.lastName || ''}`,
            details: { roles: createdUser.roles }
        });

        return createdUser;
    }

    async findAllByRole(
        role: string,
        myOnly: boolean = false,
        user?: AuthenticatedUser,
        page: number = 1,
        limit: number = 10
    ): Promise<{ data: User[], total: number }> {
        const skip = (page - 1) * limit;
        const normalizedRole = role as UserRole;
        const where: any = { roles: { has: normalizedRole } };

        if (myOnly && user) {
            const internalUser = await this.prisma.user.findUnique({ where: { id: user.userId } });
            if (internalUser) where.onboardedById = internalUser.id;
        }

        const [data, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                include: {
                    organization: { select: { id: true, name: true, type: true, isPremium: true, subscriptionMode: true } },
                    onboardedBy: { select: { firstName: true, lastName: true, activeRole: true } },
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }) as Promise<any[]>,
            this.prisma.user.count({ where }),
        ]);

        return { data, total };
    }

    async findOne(id: string): Promise<any> {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: { documents: true, organization: true }
        });
        if (!user) throw new NotFoundException('User not found');

        if (user.documents && Array.isArray(user.documents)) {
            user.documents = await Promise.all(user.documents.map(async (doc: any) => {
                if (doc.url && !doc.url.startsWith('http')) {
                    try {
                        doc.url = await this.storageService.getDownloadUrl(doc.url);
                    } catch (e) { }
                }
                return doc;
            }));
        }

        return user;
    }

    async updateUser(id: string, dto: UpdateUserDto): Promise<User> {
        await this.findOne(id);
        return this.prisma.user.update({
            where: { id },
            data: {
                firstName: dto.firstName,
                lastName: dto.lastName,
                phone: dto.phone,
                avatarUrl: dto.avatarUrl,
                status: dto.status as any,
                roles: dto.roles as any[],
                activeRole: (dto.activeRole ?? (dto.roles ? dto.roles[0] : undefined)) as any,
                reraId: dto.reraId,
                organizationId: dto.organizationId,
            },
        });
    }

    async toggleStatus(id: string): Promise<User> {
        const user = await this.findOne(id);
        const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        return this.prisma.user.update({
            where: { id },
            data: { status: newStatus as any },
        });
    }

    // ─────────────────────────────────────────────────────────────
    // PROFILE (JSON-based — single source of truth per user)
    // ─────────────────────────────────────────────────────────────

    /**
     * Returns the profileData JSON merged with any org data for the user.
     * No separate profile table queries needed.
     */
    /**
     * Returns a role-indexed map of completion status and profile data.
     * Expected by frontend components like Sidebar and ProfileCompletionPrompt.
     */
    async getProfileStatus(userId: string, roles: string[]) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: { 
                organization: true,
                onboardedBy: {
                    include: { organization: true }
                }
            },
        });
        if (!user) return {};

        const result: any = {
            roles: user.roles,
            activeRole: user.activeRole,
        };

        // For each role the user has, build a status object
        user.roles.forEach(role => {
            const profileData = (user.profileData as any) || {};
            
            // Check if profile is considered 'complete' (basic heuristic)
            let hasProfile = false;
            if (role === 'PROPERTY_PARTNER') {
                hasProfile = !!user.organizationId;
            } else if (role === 'BUYER') {
                hasProfile = true; // Buyers usually don't need much
            } else {
                // For other roles, check if role-specific keys exist in profileData
                // This is a simple check; could be more robust
                hasProfile = Object.keys(profileData).length > 0;
            }

            result[role] = {
                hasProfile,
                profileData: {
                    ...profileData,
                    // Inject organization data if applicable
                    organizationName: user.organization?.name || user.onboardedBy?.organization?.name || null,
                    isPremium: user.organization?.isPremium || user.onboardedBy?.organization?.isPremium || false,
                    subscriptionMode: user.organization?.subscriptionMode || user.onboardedBy?.organization?.subscriptionMode || 'FREE',
                }
            };
        });

        return result;
    }


    /**
     * Updates profileData JSON field for any role.
     * Deep-merges the incoming dto.profileData into the existing JSON.
     */
    async updateMyProfile(userId: string, roles: string[], dto: UpdateProfileDto) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new NotFoundException('User not found');

        const normalizedRoles = roles as UserRole[];

        // Merge new fields into the existing profileData JSON
        const existing = (user.profileData as Record<string, any>) || {};
        const incoming = dto.profileData || {};
        const mergedProfile = { ...existing, ...incoming };

        // Update core user fields
        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                firstName: dto.firstName ?? user.firstName,
                lastName: dto.lastName ?? user.lastName,
                phone: dto.phone ?? user.phone,
                activeRole: (dto.activeRole ?? user.activeRole) as any,
                profileData: mergedProfile,
            }
        });

        // Property Partner — sync key fields to Organization as well
        if (normalizedRoles.includes(UserRole.PROPERTY_PARTNER)) {
            const orgData: any = {};
            if (incoming.companyName) orgData.name = incoming.companyName;
            if (incoming.companyAddress) orgData.address = incoming.companyAddress;
            if (incoming.taxId) orgData.taxId = incoming.taxId;
            if (incoming.licenseNumber) orgData.licenseNumber = incoming.licenseNumber;

            if (Object.keys(orgData).length > 0) {
                if (user.organizationId) {
                    await this.prisma.organization.update({ where: { id: user.organizationId }, data: orgData });
                } else {
                    const org = await this.prisma.organization.create({
                        data: { name: incoming.companyName || 'New Company', type: OrganizationType.PROPERTY_PARTNER as any, ...orgData },
                    });
                    await this.prisma.user.update({ where: { id: user.id }, data: { organizationId: org.id } });
                }
            }
        }

        return this.findOne(user.id);
    }

    // ─────────────────────────────────────────────────────────────
    // FOLLOW
    // ─────────────────────────────────────────────────────────────

    async follow(followerId: string, followingId: string) {
        if (followerId === followingId) throw new BadRequestException('You cannot follow yourself');
        try {
            return await this.prisma.follow.upsert({
                where: { followerId_followingId: { followerId, followingId } },
                create: { followerId, followingId },
                update: {},
            });
        } catch (error: any) {
            throw new InternalServerErrorException(`Failed to follow user: ${error.message}`);
        }
    }

    async unfollow(followerId: string, followingId: string) {
        try {
            await this.prisma.follow.delete({ where: { followerId_followingId: { followerId, followingId } } });
        } catch { /* already unfollowed */ }
        return { success: true };
    }

    async isFollowing(followerId: string, followingId: string): Promise<boolean> {
        const follow = await this.prisma.follow.findUnique({
            where: { followerId_followingId: { followerId, followingId } },
        });
        return !!follow;
    }

    async getFollowerCount(userId: string): Promise<number> {
        return this.prisma.follow.count({ where: { followingId: userId } });
    }

    async getFollowingCount(userId: string): Promise<number> {
        return this.prisma.follow.count({ where: { followerId: userId } });
    }

    // ─────────────────────────────────────────────────────────────
    // DOCUMENTS
    // ─────────────────────────────────────────────────────────────

    async saveUserDocument(userId: string, category: string, name: string, urlOrKey: string) {
        // Extract key if a full URL is provided
        const key = this.storageService.extractKey(urlOrKey);

        const existing = await this.prisma.userDocument.findFirst({ where: { userId, category, name } });

        if (existing) {
            return this.prisma.userDocument.update({
                where: { id: existing.id },
                data: { url: key, status: 'uploaded', updatedAt: new Date() }
            });
        }

        return this.prisma.userDocument.create({
            data: { userId, category, name, url: key, status: 'uploaded' },
        });
    }

    async getUserDocuments(userId: string) {
        const docs = await this.prisma.userDocument.findMany({ where: { userId } });
        return Promise.all(docs.map(async (doc) => {
            if (doc.url && !doc.url.startsWith('http')) {
                try {
                    doc.url = await this.storageService.getDownloadUrl(doc.url);
                } catch (e) { }
            }
            return doc;
        }));
    }
}
