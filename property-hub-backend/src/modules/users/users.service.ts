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
import { validateRoleCombination } from '../../common/utils/role-validator.util';

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
        let normalizedRoles = rawRoles
            .filter(r => Object.values(UserRole).includes(r as any)) as UserRole[];

        // Safety: Ensure incoming roles don't violate rules
        // If they do, we'll just keep the first one to be safe during sync
        try {
            validateRoleCombination(normalizedRoles);
        } catch {
            normalizedRoles = normalizedRoles.length > 0 ? [normalizedRoles[0]] : [];
        }

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

        // Validate role combination
        if (dto.roles) {
            validateRoleCombination(dto.roles as UserRole[]);
        }

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
            
            // Validate consolidated roles
            validateRoleCombination(updatedRoles as UserRole[]);
            
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
        let branchId = dto.branchId ?? null;

        const isLoanPartner = dto.roles.includes(UserRole.LOAN_PARTNER as UserRole);
        const needsOrg = dto.roles.includes(UserRole.PROPERTY_PARTNER) || dto.roles.includes(UserRole.GROWTH_PARTNER as UserRole) || isLoanPartner;
        const hasBusinessInfo = dto.companyName;

        if (isLoanPartner) {
            if (!dto.bankId) {
                throw new BadRequestException('bankId is required for Loan Partner registration');
            }

            const bank = await this.prisma.bank.findUnique({
                where: { id: dto.bankId },
                select: { organizationId: true }
            });

            if (!bank || !bank.organizationId) {
                throw new BadRequestException('Selected bank is not properly configured');
            }

            organizationId = bank.organizationId;

            // Handle Branch (Find or Create)
            if (!branchId) {
                if (!dto.cityId && (!dto.cityName || !dto.stateName)) {
                    throw new BadRequestException('cityId or (cityName and stateName) are required for Loan Partner branch registration');
                }

                let targetCityId = dto.cityId;

                // If no cityId provided, or it's not a UUID, we look up/create by name
                const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(dto.cityId || '');
                if (!isUuid && dto.cityName && dto.stateName) {
                    const normalizedCity = dto.cityName.trim();
                    const normalizedState = dto.stateName.trim();

                    const existingCity = await this.prisma.city.findFirst({
                        where: {
                            name: { equals: normalizedCity, mode: 'insensitive' },
                            state: { equals: normalizedState, mode: 'insensitive' }
                        }
                    });

                    if (existingCity) {
                        targetCityId = existingCity.id;
                    } else {
                        const newCity = await this.prisma.city.create({
                            data: {
                                name: normalizedCity,
                                state: normalizedState,
                            }
                        });
                        targetCityId = newCity.id;
                    }
                }

                if (!dto.branchName) {
                    throw new BadRequestException('branchName is required');
                }

                const normalizedName = (dto.branchName || "").trim().toLowerCase();

                try {
                    const branch = await this.prisma.bankBranch.create({
                        data: {
                            bankId: dto.bankId,
                            organizationId: bank.organizationId,
                            cityId: targetCityId!,
                            name: normalizedName,
                            address: dto.companyAddress,
                        }
                    });
                    branchId = branch.id;
                } catch (error) {
                    // Handle unique constraint (race condition)
                    const existingBranch = await this.prisma.bankBranch.findFirst({
                        where: {
                            bankId: dto.bankId,
                            cityId: targetCityId!,
                            name: normalizedName
                        }
                    });
                    if (!existingBranch) throw error;
                    branchId = existingBranch.id;
                }
            } else {
                // Validate branch belongs to the selected bank
                const branch = await this.prisma.bankBranch.findUnique({ where: { id: branchId } });
                if (!branch || branch.bankId !== dto.bankId) {
                    throw new BadRequestException('Invalid branch selected for the chosen bank');
                }
            }
        } else if (needsOrg && hasBusinessInfo && !organizationId) {
            let orgType = OrganizationType.GROWTH_PARTNER;
            if (dto.roles.includes(UserRole.PROPERTY_PARTNER)) orgType = OrganizationType.PROPERTY_PARTNER;
            const org = await this.prisma.organization.create({
                data: {
                    name: dto.companyName as string,
                    type: orgType as any,
                    address: dto.companyAddress,
                    taxId: dto.taxId,
                    licenseNumber: dto.licenseNumber,
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
                branchId,
                onboardedById,
                profileData: (dto.roles.includes(UserRole.PROPERTY_PARTNER) || 
                             dto.roles.includes(UserRole.GROWTH_PARTNER as UserRole) || 
                             dto.roles.includes(UserRole.LOAN_PARTNER as UserRole)) ? {
                    companyName: dto.companyName,
                    companyAddress: dto.companyAddress,
                    taxId: dto.taxId,
                    licenseNumber: dto.licenseNumber,
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
        limit: number = 10,
        search?: string
    ): Promise<{ data: User[], total: number }> {
        const skip = (page - 1) * limit;
        const normalizedRole = role as UserRole;
        const where: any = { roles: { has: normalizedRole } };

        if (myOnly && user) {
            const internalUser = await this.prisma.user.findUnique({ where: { id: user.userId } });
            if (internalUser) where.onboardedById = internalUser.id;
        }

        if (search) {
            where.OR = [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ];
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

        if (dto.roles) {
            validateRoleCombination(dto.roles as UserRole[]);
        }

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
            if (role === 'PROPERTY_PARTNER' || role === 'GROWTH_PARTNER' || role === 'LOAN_PARTNER') {
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
                    companyName: user.organization?.name || user.onboardedBy?.organization?.name || null,
                    tagline: user.organization?.tagline || null,
                    about: user.organization?.about || null,
                    website: user.organization?.websiteUrl || null,
                    industry: user.organization?.industry || null,
                    companySize: user.organization?.companySize || null,
                    foundedYear: user.organization?.foundedYear || null,
                    specialties: user.organization?.specialties || [],
                    companyAddress: user.organization?.address || null,
                    taxId: user.organization?.taxId || null,
                    licenseNumber: user.organization?.licenseNumber || null,
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

        // Validate current roles (just in case they are updated elsewhere)
        validateRoleCombination(normalizedRoles);

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

        // Property Partner & Growth Partner & Loan Partner — sync key fields to Organization as well
        if (normalizedRoles.includes(UserRole.PROPERTY_PARTNER) || normalizedRoles.includes(UserRole.GROWTH_PARTNER) || normalizedRoles.includes(UserRole.LOAN_PARTNER)) {
            const orgData: any = {};
            
            // Extract from incoming profile data
            if (incoming.companyName) orgData.name = incoming.companyName;
            if (incoming.companyAddress) orgData.address = incoming.companyAddress;
            if (incoming.taxId) orgData.taxId = incoming.taxId;
            if (incoming.licenseNumber) orgData.licenseNumber = incoming.licenseNumber;
            if (incoming.tagline) orgData.tagline = incoming.tagline;
            if (incoming.about) orgData.about = incoming.about;
            if (incoming.website) orgData.websiteUrl = incoming.website;
            if (incoming.industry) orgData.industry = incoming.industry;
            if (incoming.companySize) orgData.companySize = incoming.companySize;
            if (incoming.foundedYear) orgData.foundedYear = parseInt(incoming.foundedYear);
            if (incoming.specialties) orgData.specialties = incoming.specialties;

            // Deciding if we need to sync with Organization
            const needsSync = user.organizationId || 
                             normalizedRoles.includes(UserRole.PROPERTY_PARTNER) || 
                             (normalizedRoles.includes(UserRole.GROWTH_PARTNER) && incoming.partnerType === 'Agency');

            if (Object.keys(orgData).length > 0 && needsSync) {
                if (user.organizationId) {
                    await this.prisma.organization.update({ 
                        where: { id: user.organizationId }, 
                        data: orgData 
                    });
                } else if (!normalizedRoles.includes(UserRole.LOAN_PARTNER)) {
                    // Only auto-create org for non-Loan Partners. Bank linkage required for LPs.
                    let orgType = OrganizationType.GROWTH_PARTNER;
                    if (normalizedRoles.includes(UserRole.PROPERTY_PARTNER)) orgType = OrganizationType.PROPERTY_PARTNER;
                    
                    const org = await this.prisma.organization.create({
                        data: { 
                            name: incoming.companyName || 'New Company', 
                            type: orgType as any, 
                            ...orgData 
                        },
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
