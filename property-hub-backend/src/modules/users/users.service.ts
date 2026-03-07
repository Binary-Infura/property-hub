import { Injectable, BadRequestException, NotFoundException, InternalServerErrorException, HttpException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';
import { UpdateUserMetadataDto, CreateUserDto, UpdateUserDto, InviteUserDto, InviteCentralAuthorityDto, InvitationResponse, UpdateProfileDto } from './users.dto';
import { UserMetadata, User } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { AuthenticatedUser } from '../../common/interfaces/jwt-payload.interface';
import { UserRole } from '../../common/enums/role.enum';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(
        private prisma: PrismaService,
        private configService: ConfigService,
        private activityLogsService: ActivityLogsService,
    ) { }

    private async hashPassword(password: string): Promise<string> {
        return bcrypt.hash(password, 10);
    }

    /**
     * Invite a user with region-specific roles
     */
    async inviteUser(dto: InviteUserDto): Promise<InvitationResponse> {
        try {
            const tempPassword = "password"; // Or generate random
            const passwordHash = await this.hashPassword(tempPassword);

            // Check if user already exists
            const existingUser = await this.prisma.user.findUnique({
                where: { email: dto.email }
            });

            if (existingUser) {
                throw new BadRequestException('User with this email already exists');
            }

            // Create user in internal DB
            const user = await this.prisma.user.create({
                data: {
                    email: dto.email,
                    firstName: dto.firstName,
                    lastName: dto.lastName,
                    passwordHash,
                    roles: dto.roles || [],
                    status: 'active',
                }
            });

            return {
                userId: user.id,
                email: dto.email,
                temporaryPassword: tempPassword,
            };
        } catch (error: any) {
            console.error('Error inviting user:', error);
            if (error instanceof HttpException) {
                throw error;
            }
            throw new InternalServerErrorException(error.message || 'Failed to invite user');
        }
    }

    async inviteCentralAuthorityUser(dto: InviteCentralAuthorityDto): Promise<InvitationResponse> {
        return this.inviteUser({
            ...dto,
            roles: ['central-authority'],
        });
    }

    // --- User Metadata Methods (Current User) ---

    async findOrCreateUserMetadata(userId: string): Promise<UserMetadata> {
        return this.prisma.userMetadata.upsert({
            where: { userId },
            create: { userId },
            update: {},
        });
    }

    async updateUserMetadata(userId: string, dto: UpdateUserMetadataDto): Promise<UserMetadata> {
        return this.prisma.userMetadata.upsert({
            where: { userId },
            create: { userId },
            update: {
                theme: dto.theme,
                notifications: dto.notifications as any,
                onboardingStatus: dto.onboardingStatus,
                language: dto.language,
            },
        });
    }

    async getUserMetadata(userId: string): Promise<UserMetadata> {
        return this.prisma.userMetadata.findUnique({
            where: { userId },
        });
    }

    /**
     * Ensures an authenticated user exists in the local User table.
     * This is used for managers and authorities who might not be onboarded
     * but need to be referenced in ownership tracking.
     */
    async ensureUserSynced(authenticatedUser: AuthenticatedUser): Promise<User> {
        // Look up by JWT sub (which is user.id in our native auth)
        let user = await this.prisma.user.findUnique({
            where: { id: authenticatedUser.userId },
        });

        if (!user && authenticatedUser.email) {
            user = await this.prisma.user.findUnique({
                where: { email: authenticatedUser.email },
            });
        }

        if (user) {
            return user;
        }

        const roles = authenticatedUser.roles.includes('central-authority')
            ? ['central-authority']
            : authenticatedUser.roles.includes('onboarding-manager')
                ? ['onboarding-manager']
                : authenticatedUser.roles.includes('broker')
                    ? ['broker']
                    : ['unknown'];

        user = await this.prisma.user.create({
            data: {
                id: authenticatedUser.userId,
                email: authenticatedUser.email || 'unknown',
                firstName: authenticatedUser.firstName || authenticatedUser.username || 'System',
                lastName: authenticatedUser.lastName || 'User',
                roles,
                status: 'active',
            },
        });

        return user;
    }

    // --- User Management Methods (Admin/Manager) ---

    async createUser(dto: CreateUserDto, user?: AuthenticatedUser): Promise<User> {

        // 2. Prepare for Keycloak
        const firstName = dto.firstName;
        const lastName = dto.lastName || 'User';

        if (!firstName) {
            throw new BadRequestException('firstName must be provided');
        }


        // 3. Hash password and prepare user
        const passwordHash = await this.hashPassword(dto.password || 'password');

        // 4. Find internal onboarder ID
        let onboardedById = null;
        if (user) {
            const internalUser = await this.prisma.user.findUnique({
                where: { id: user.userId },
            });
            if (internalUser) {
                onboardedById = internalUser.id;
            }
        }

        const createdUser = await this.prisma.user.create({
            data: {
                passwordHash,
                firstName: dto.firstName,
                lastName: dto.lastName,
                email: dto.email,
                phone: dto.phone,
                roles: dto.roles,
                agencyName: dto.agencyName,
                reraId: dto.reraId,
                rating: dto.rating,
                onboardedById,
            },
        });

        // 6. Create relevant profile based on role
        if (dto.roles.includes('property-partner')) {
            await this.prisma.propertyPartnerProfile.create({
                data: {
                    userId: createdUser.id,
                    companyName: dto.companyName || dto.agencyName || 'New Project Partner',
                    companyAddress: dto.companyAddress || '',
                    taxId: dto.taxId || '',
                    licenseNumber: dto.licenseNumber || '',
                }
            });
        }

        await this.activityLogsService.log({
            userId: onboardedById || createdUser.id,
            type: 'info',
            action: 'User Registered',
            target: createdUser.firstName + ' ' + (createdUser.lastName || ''),
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
        const where: any = { roles: { has: role } };


        if (myOnly && user) {
            const internalUser = await this.prisma.user.findUnique({
                where: { id: user.userId },
            });
            if (internalUser) {
                where.onboardedById = internalUser.id;
            }
        }

        const [data, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                include: {

                    onboardedBy: {
                        select: {
                            firstName: true,
                            lastName: true,
                            roles: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }) as Promise<any[]>,
            this.prisma.user.count({ where }),
        ]);

        if (role === 'property-partner') {
            const userIds = data.map(u => u.id);
            const profiles = await this.prisma.propertyPartnerProfile.findMany({
                where: { userId: { in: userIds } }
            });
            data.forEach(user => {
                user.propertyPartnerProfile = profiles.find(p => p.userId === user.id);
            });
        }

        return { data, total };
    }

    async findOne(id: string): Promise<User> {
        const user = await this.prisma.user.findUnique({
            where: { id },

        });
        if (!user) throw new NotFoundException('User not found');
        return user;
    }

    async updateUser(id: string, dto: UpdateUserDto): Promise<User> {
        const existingUser = await this.findOne(id);

        const data: any = {
            firstName: dto.firstName,
            lastName: dto.lastName,
            phone: dto.phone,
            status: dto.status,
            roles: dto.roles,
            defaultRole: dto.defaultRole,
            agencyName: dto.agencyName,
            reraId: dto.reraId,
            rating: dto.rating
        };


        if (existingUser.roles.includes('property-partner')) {
            const profileData: any = {};
            if (dto.companyName) profileData.companyName = dto.companyName;
            if (dto.companyAddress) profileData.companyAddress = dto.companyAddress;
            if (dto.taxId) profileData.taxId = dto.taxId;
            if (dto.licenseNumber) profileData.licenseNumber = dto.licenseNumber;

            if (Object.keys(profileData).length > 0) {
                await this.prisma.propertyPartnerProfile.upsert({
                    where: { userId: id },
                    create: {
                        userId: id,
                        companyName: dto.companyName || dto.agencyName || 'New Project Partner',
                        ...profileData
                    },
                    update: profileData
                });
            }
        }

        return this.prisma.user.update({
            where: { id },
            data,

        });
    }

    async toggleStatus(id: string): Promise<User> {
        const user = await this.findOne(id);
        const newStatus = user.status === 'active' ? 'inactive' : 'active';
        return this.prisma.user.update({
            where: { id },
            data: { status: newStatus },

        });
    }

    async getProfileStatus(userId: string, roles: string[]) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) return {};

        const internalId = user.id;
        const status: any = {};
        const businessRoles: string[] = Object.values(UserRole);

        for (const role of roles) {
            if (!businessRoles.includes(role)) continue;

            let profileData = null;

            switch (role) {
                case UserRole.CENTRAL_AUTHORITY:
                    profileData = await this.prisma.centralAuthorityProfile.findUnique({ where: { userId: internalId } });
                    break;
                case UserRole.PROPERTY_PARTNER:
                    profileData = await this.prisma.propertyPartnerProfile.findUnique({ where: { userId: internalId } });
                    break;
                case UserRole.BROKER:
                    profileData = await this.prisma.brokerProfile.findUnique({ where: { userId: internalId } });
                    break;
                case UserRole.MARKETING_MANAGER:
                    profileData = await this.prisma.marketingManagerProfile.findUnique({ where: { userId: internalId } });
                    break;
                case UserRole.CONSULTANT:
                    profileData = await this.prisma.consultantProfile.findUnique({ where: { userId: internalId } });
                    break;
                case UserRole.BUYER:
                    profileData = await this.prisma.buyerProfile.findUnique({ where: { userId: internalId } });
                    break;

                case UserRole.INFLUENCER:
                    profileData = await this.prisma.influencerProfile.findUnique({ where: { userId: internalId } });
                    break;
            }

            status[role] = {
                hasProfile: !!profileData,
                profileData
            };
        }

        return status;
    }

    async updateMyProfile(userId: string, roles: string[], dto: UpdateProfileDto) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        // Update basic info
        await this.prisma.user.update({
            where: { id: user.id },
            data: {
                firstName: dto.firstName,
                lastName: dto.lastName,
                phone: dto.phone,
                defaultRole: dto.defaultRole,
                // Also update agencyName if companyName is provided and user has property-partner role
                agencyName: (user.roles.includes('property-partner') && dto.companyName) ? dto.companyName : undefined
            }
        });

        // Update role-specific profile
        if (user.roles.includes('property-partner')) {
            const profileData: any = {};
            if (dto.companyName) profileData.companyName = dto.companyName;
            if (dto.companyAddress) profileData.companyAddress = dto.companyAddress;
            if (dto.taxId) profileData.taxId = dto.taxId;
            if (dto.licenseNumber) profileData.licenseNumber = dto.licenseNumber;

            if (Object.keys(profileData).length > 0) {
                await this.prisma.propertyPartnerProfile.upsert({
                    where: { userId: user.id },
                    create: {
                        userId: user.id,
                        companyName: dto.companyName || user.agencyName || 'New Project Partner',
                        ...profileData
                    },
                    update: profileData
                });
            }
        }

        if (user.roles.includes('influencer')) {
            const profileData: any = {};
            if (dto.socialMediaLinks) profileData.socialMediaLinks = dto.socialMediaLinks;
            if (dto.reach) profileData.reach = dto.reach;
            if (dto.niche) profileData.niche = dto.niche;

            if (Object.keys(profileData).length > 0) {
                await this.prisma.influencerProfile.upsert({
                    where: { userId: user.id },
                    create: {
                        userId: user.id,
                        ...profileData
                    },
                    update: profileData
                });
            }
        }

        if (user.roles.includes('broker')) {
            const profileData: any = {};
            if (dto.agencyBusinessName) profileData.agencyBusinessName = dto.agencyBusinessName;
            if (dto.reraNumber) profileData.reraNumber = dto.reraNumber;
            if (dto.officeAddress) profileData.officeAddress = dto.officeAddress;

            if (Object.getOwnPropertyNames(profileData).length > 0) {
                await this.prisma.brokerProfile.upsert({
                    where: { userId: user.id },
                    create: {
                        userId: user.id,
                        agencyBusinessName: dto.agencyBusinessName || user.agencyName || 'New Broker',
                        ...profileData
                    },
                    update: profileData
                });
            }
        }

        if (user.roles.includes('consultant')) {
            const profileData: any = {};
            if (dto.specialization) profileData.specialization = dto.specialization;
            if (dto.experienceYears) profileData.experienceYears = dto.experienceYears;

            if (Object.keys(profileData).length > 0) {
                await this.prisma.consultantProfile.upsert({
                    where: { userId: user.id },
                    create: {
                        userId: user.id,
                        ...profileData
                    },
                    update: profileData
                });
            }
        }

        if (user.roles.includes('buyer')) {
            const profileData: any = {};
            if (dto.budgetMin) profileData.budgetMin = dto.budgetMin;
            if (dto.budgetMax) profileData.budgetMax = dto.budgetMax;
            if (dto.preferredLocations) profileData.preferredLocations = dto.preferredLocations;

            if (Object.keys(profileData).length > 0) {
                await this.prisma.buyerProfile.upsert({
                    where: { userId: user.id },
                    create: {
                        userId: user.id,
                        ...profileData
                    },
                    update: profileData
                });
            }
        }

        if (user.roles.includes('marketing-manager')) {
            const profileData: any = {};
            if (dto.campaignBudgetLimit) profileData.campaignBudgetLimit = dto.campaignBudgetLimit;

            if (Object.keys(profileData).length > 0) {
                await this.prisma.marketingManagerProfile.upsert({
                    where: { userId: user.id },
                    create: {
                        userId: user.id,
                        ...profileData
                    },
                    update: profileData
                });
            }
        }

        if (user.roles.includes('central-authority')) {
            const profileData: any = {};
            if (dto.department) profileData.department = dto.department;
            if (dto.accessLevel) profileData.accessLevel = dto.accessLevel;

            if (Object.keys(profileData).length > 0) {
                await this.prisma.centralAuthorityProfile.upsert({
                    where: { userId: user.id },
                    create: {
                        userId: user.id,
                        ...profileData
                    },
                    update: profileData
                });
            }
        }

        return this.findOne(user.id);
    }
    async follow(followerId: string, followingId: string) {
        if (!(this.prisma as any).follow) {
            console.error('CRITICAL: prisma.follow is undefined. Prisma client may need regeneration or restart.');
            throw new InternalServerErrorException('Prisma client not initialized with Follow model');
        }

        if (followerId === followingId) {
            throw new BadRequestException('You cannot follow yourself');
        }

        try {
            return await (this.prisma as any).follow.upsert({
                where: {
                    followerId_followingId: {
                        followerId,
                        followingId,
                    },
                },
                create: {
                    followerId,
                    followingId,
                },
                update: {},
            });
        } catch (error: any) {
            console.error(`Prisma Error in follow (follower: ${followerId}, following: ${followingId}):`, error);
            throw new InternalServerErrorException(`Failed to follow user: ${error.message}`);
        }
    }

    async unfollow(followerId: string, followingId: string) {
        try {
            await (this.prisma as any).follow.delete({
                where: {
                    followerId_followingId: {
                        followerId,
                        followingId,
                    },
                },
            });
            return { success: true };
        } catch (error) {
            // If already not following, prisma might throw
            return { success: true };
        }
    }

    async isFollowing(followerId: string, followingId: string): Promise<boolean> {
        const follow = await (this.prisma as any).follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId,
                    followingId,
                },
            },
        });
        return !!follow;
    }

    async getFollowerCount(userId: string): Promise<number> {
        return (this.prisma as any).follow.count({
            where: { followingId: userId }
        });
    }

    async getFollowingCount(userId: string): Promise<number> {
        return (this.prisma as any).follow.count({
            where: { followerId: userId }
        });
    }
}
