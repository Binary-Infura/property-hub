import { Injectable, BadRequestException, NotFoundException, InternalServerErrorException, HttpException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
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
                    role: dto.role,
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
            role: 'central-authority',
        });
    }

    // --- User Metadata Methods (Current User) ---

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

    async updateUserMetadata(userId: string, dto: UpdateUserMetadataDto): Promise<UserMetadata> {
        const metadata = await this.getUserMetadata(userId);
        if (!metadata) throw new NotFoundException('User metadata not found');

        return this.prisma.userMetadata.update({
            where: { id: metadata.id },
            data: {
                theme: dto.theme,
                notifications: dto.notifications as any,
                onboardingStatus: dto.onboardingStatus,
                language: dto.language,
            },
        });
    }

    async getUserMetadata(userId: string): Promise<UserMetadata> {
        let userMetadata = await this.prisma.userMetadata.findUnique({
            where: { id: userId }, // Fallback to id mapping if keycloakId removed
        });

        if (!userMetadata) {
            // For consistency during transition, try keycloakId as well
            userMetadata = await this.prisma.userMetadata.findFirst({
                where: { keycloakId: userId }
            });
        }

        return userMetadata;
    }

    /**
     * Ensures an authenticated user exists in the local User table.
     * This is used for managers and authorities who might not be onboarded
     * but need to be referenced in ownership tracking.
     */
    async ensureUserSynced(authenticatedUser: AuthenticatedUser): Promise<User> {
        // Normalize userId (strip prefixes like onrtrt: if present)
        const normalizedKeycloakId = authenticatedUser.userId.includes(':')
            ? authenticatedUser.userId.split(':').pop()
            : authenticatedUser.userId;

        let user = await this.prisma.user.findUnique({
            where: { keycloakId: normalizedKeycloakId },
        });

        if (!user && authenticatedUser.email) {
            // Fallback: search by email
            user = await this.prisma.user.findUnique({
                where: { email: authenticatedUser.email },
            });

            if (user) {
                // Link the existing user to this Keycloak ID if not already linked
                user = await this.prisma.user.update({
                    where: { id: user.id },
                    data: { keycloakId: normalizedKeycloakId },
                });
            }
        }

        if (!user) {
            // Determine a default role if not provided in token (fallback)
            const role = authenticatedUser.roles.includes('central-authority')
                ? 'central-authority'
                : authenticatedUser.roles.includes('onboarding-manager')
                    ? 'onboarding-manager'
                    : authenticatedUser.roles.includes('dsa')
                        ? 'dsa'
                        : 'unknown';

            user = await this.prisma.user.create({
                data: {
                    keycloakId: normalizedKeycloakId,
                    email: authenticatedUser.email || 'unknown',
                    firstName: authenticatedUser.firstName || authenticatedUser.username || 'System',
                    lastName: authenticatedUser.lastName || 'User',
                    role: role,
                    status: 'active',
                },
            });
        }

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
                where: { keycloakId: user.userId },
            });
            if (internalUser) {
                onboardedById = internalUser.id;
            }
        }

        // 5. Save in Local DB
        const createdUser = await this.prisma.user.create({
            data: {
                passwordHash,
                firstName: dto.firstName,
                lastName: dto.lastName,
                email: dto.email,
                phone: dto.phone,
                role: dto.role,
                agencyName: dto.agencyName,
                reraId: dto.reraId,
                rating: dto.rating,
                onboardedById,
            },
        });

        // 6. Create relevant profile based on role
        if (dto.role === 'service-provider' && dto.businessName) {
            await this.prisma.serviceProviderProfile.create({
                data: {
                    userId: createdUser.id,
                    businessName: dto.businessName,
                    category: dto.category || 'General',
                    location: dto.location || 'N/A',
                    availabilityDays: dto.availabilityDays || [],
                    availabilityHours: dto.availabilityHours || 'N/A',
                    rates: dto.rates,
                    portfolio: dto.portfolio,
                }
            });
        }

        if (dto.role === 'property-partner') {
            await this.prisma.propertyPartnerProfile.create({
                data: {
                    userId: createdUser.id,
                    companyName: dto.companyName || dto.agencyName || 'New Property Partner',
                    companyAddress: dto.companyAddress || '',
                    taxId: dto.taxId || '',
                    licenseNumber: dto.licenseNumber || '',
                }
            });
        }

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
        const where: any = { role };


        if (myOnly && user) {
            const internalUser = await this.prisma.user.findUnique({
                where: { keycloakId: user.userId },
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
                            role: true
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

        if (role === 'service-provider') {
            const userIds = data.map(u => u.id);
            const profiles = await this.prisma.serviceProviderProfile.findMany({
                where: { userId: { in: userIds } }
            });
            data.forEach(user => {
                user.serviceProviderProfile = profiles.find(p => p.userId === user.id);
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
            agencyName: dto.agencyName,
            reraId: dto.reraId,
            rating: dto.rating
        };


        if (existingUser.role === 'property-partner') {
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
                        companyName: dto.companyName || dto.agencyName || 'New Property Partner',
                        ...profileData
                    },
                    update: profileData
                });
            }
        }

        if (existingUser.role === 'service-provider') {
            const profileData: any = {};
            if (dto.businessName) profileData.businessName = dto.businessName;
            if (dto.category) profileData.category = dto.category;
            if (dto.location) profileData.location = dto.location;
            if (dto.availabilityDays) profileData.availabilityDays = dto.availabilityDays;
            if (dto.availabilityHours) profileData.availabilityHours = dto.availabilityHours;
            if (dto.rates) profileData.rates = dto.rates;
            if (dto.portfolio) profileData.portfolio = dto.portfolio;

            if (Object.keys(profileData).length > 0) {
                await this.prisma.serviceProviderProfile.upsert({
                    where: { userId: id },
                    create: {
                        userId: id,
                        businessName: dto.businessName || 'New Service Provider',
                        category: dto.category || 'General',
                        location: dto.location || 'N/A',
                        availabilityHours: dto.availabilityHours || 'N/A',
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

    async getProfileStatus(keycloakId: string, roles: string[]) {
        const user = await this.prisma.user.findUnique({
            where: { keycloakId }
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
                case UserRole.DSA:
                    profileData = await this.prisma.dsaProfile.findUnique({ where: { userId: internalId } });
                    break;
                case UserRole.COMMISSION_MANAGER:
                    profileData = await this.prisma.commissionManagerProfile.findUnique({ where: { userId: internalId } });
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
                case UserRole.SERVICE_PROVIDER:
                    profileData = await this.prisma.serviceProviderProfile.findUnique({ where: { userId: internalId } });
                    break;
                case UserRole.INFLUENCER:
                    profileData = await this.prisma.influencerProfile.findUnique({ where: { userId: internalId } });
                    break;
            }

            status[role] = {
                hasProfile: (role === UserRole.SERVICE_PROVIDER || role === UserRole.PROPERTY_PARTNER) ? !!profileData : true,
                profileData
            };
        }

        return status;
    }

    async updateMyProfile(keycloakId: string, roles: string[], dto: UpdateProfileDto) {
        const user = await this.prisma.user.findUnique({
            where: { keycloakId },
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
                // Also update agencyName if companyName is provided and user is property-partner
                agencyName: (user.role === 'property-partner' && dto.companyName) ? dto.companyName : undefined
            }
        });

        // Update role-specific profile
        if (user.role === 'property-partner') {
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
                        companyName: dto.companyName || user.agencyName || 'New Property Partner',
                        ...profileData
                    },
                    update: profileData
                });
            }
        }

        if (user.role === 'service-provider') {
            const profileData: any = {};
            if (dto.businessName) profileData.businessName = dto.businessName;
            if (dto.category) profileData.category = dto.category;
            if (dto.location) profileData.location = dto.location;

            if (Object.keys(profileData).length > 0) {
                await this.prisma.serviceProviderProfile.upsert({
                    where: { userId: user.id },
                    create: {
                        userId: user.id,
                        businessName: dto.businessName || 'New Service Provider',
                        category: dto.category || 'General',
                        location: dto.location || 'N/A',
                        availabilityHours: 'N/A',
                        ...profileData
                    },
                    update: profileData
                });
            }
        }

        if (user.role === 'influencer') {
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

        return this.findOne(user.id);
    }
}
