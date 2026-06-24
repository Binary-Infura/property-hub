import { Injectable, NotFoundException, BadRequestException, Logger, InternalServerErrorException, HttpException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { MailService } from '../mail/mail.service';
import { WhatsappService } from '../whatsapp/whatsapp.service';
import { ConfigService } from '@nestjs/config';
import { CreateInvitationDto, RegisterInvitationDto, PublicPartnerSignupDto } from './invitations.dto';
import * as crypto from 'crypto';
import { InvitationStatus, UserStatus } from '@prisma/client';
import { UsersService } from '../users/users.service';
import { UserRole } from '../../common/enums/role.enum';
import { validateRoleCombination } from '../../common/utils/role-validator.util';

@Injectable()
export class InvitationsService {
  private readonly logger = new Logger(InvitationsService.name);

  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
    private whatsappService: WhatsappService,
    private configService: ConfigService,
    private usersService: UsersService,
  ) {}

  async createInvitation(dto: CreateInvitationDto, invitedById: string) {
    try {
      if (!invitedById) {
        throw new BadRequestException('Inviter ID is required');
      }

      // Validate role combination
      if (dto.roles) {
        validateRoleCombination(dto.roles as UserRole[]);
      }

      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 48); // 48 hours expiry

      const invitation = await this.prisma.invitation.create({
        data: {
          email: dto.email,
          phone: dto.phone,
          roles: dto.roles as any[],
          type: dto.type || 'PLATFORM',
          token,
          invitedById,
          expiresAt,
        } as any,
      });

      const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3101';
      const inviteLink = `${frontendUrl}/register?token=${token}`;

      if (dto.email) {
        await this.mailService.sendInvitationEmail(dto.email, dto.roles, inviteLink);
      }

      if (dto.phone) {
        await this.whatsappService.sendInvitationWhatsApp(dto.phone, dto.roles, inviteLink);
      }

      return invitation;
    } catch (error: any) {
      this.logger.error(`Failed to create invitation: ${error.message}`, error.stack);
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(error.message || 'Failed to create invitation');
    }
  }

  async publicSignup(dto: PublicPartnerSignupDto) {
    try {
      // 0. Validate role combination
      if (dto.roles) {
        validateRoleCombination(dto.roles as UserRole[]);
      }

      // 1. Check for existing user
      const existingUser = await this.prisma.user.findUnique({ where: { email: dto.email } });
      if (existingUser) {
        throw new BadRequestException('Email is already registered. Please sign in or use a different email.');
      }

      // 2. Find a system admin to be the "inviter"
      const systemAdmin = await this.prisma.user.findFirst({
        where: { roles: { has: UserRole.CENTRAL_AUTHORITY } },
        select: { id: true }
      });

      if (!systemAdmin) {
        throw new InternalServerErrorException('System administrator not found. Please contact support.');
      }

      // 3. Create a self-signed invitation
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 48);

      const invitation = await this.prisma.invitation.create({
        data: {
          email: dto.email,
          phone: dto.phone,
          roles: dto.roles as any[],
          type: 'THIRD_PARTY',
          token,
          invitedById: systemAdmin.id,
          expiresAt,
          status: InvitationStatus.PENDING,
        } as any,
      });

      // 4. Create the User in PENDING_VERIFICATION status
      // We reuse UsersService logic for consistency (Org creation, password hashing, etc)
      const user = await this.usersService.createUser({
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        password: dto.password,
        phone: dto.phone,
        roles: dto.roles,
        activeRole: dto.roles[0],
        companyName: dto.companyName,
        companyAddress: dto.companyAddress,
        taxId: dto.taxId,
        licenseNumber: dto.licenseNumber,
        bankId: dto.bankId,
        branchId: dto.branchId,
        branchName: dto.branchName,
        cityId: dto.cityId,
        cityName: dto.cityName,
        stateName: dto.stateName,
      });

      // Override status to PENDING_VERIFICATION
      await this.prisma.user.update({
        where: { id: user.id },
        data: { status: UserStatus.PENDING_VERIFICATION }
      });

      // 5. Send Verification Email
      const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3101';
      const verifyLink = `${frontendUrl}/verify?token=${token}`;

      if (dto.email) {
        await this.mailService.sendVerificationEmail(dto.email, verifyLink);
      }

      return { success: true, message: 'Signup successful. Please check your email for verification link.' };
    } catch (error: any) {
      if (error instanceof HttpException) throw error;
      this.logger.error(`Failed public signup: ${error.message}`, error.stack);
      throw new InternalServerErrorException(error.message || 'Signup failed');
    }
  }

  async verifyPublicSignup(token: string) {
    const invitation = await this.prisma.invitation.findUnique({
      where: { token },
    });

    if (!invitation || !invitation.email) {
      throw new NotFoundException('Invalid or expired verification token');
    }

    if (invitation.status !== InvitationStatus.PENDING) {
      throw new BadRequestException(`Verification already completed or token is ${invitation.status.toLowerCase()}`);
    }

    const user = await this.prisma.user.findUnique({
      where: { email: invitation.email }
    });

    if (!user) {
      throw new NotFoundException('User associated with this token not found');
    }

    // Activate User
    await this.prisma.user.update({
      where: { id: user.id },
      data: { 
        status: UserStatus.ACTIVE,
        isEmailVerified: true 
      }
    });

    // Mark Invitation as Accepted
    await this.prisma.invitation.update({
      where: { id: invitation.id },
      data: { status: InvitationStatus.ACCEPTED }
    });

    return { success: true, message: 'Account verified successfully!' };
  }

  async verifyInvitation(token: string) {
    const invitation = await this.prisma.invitation.findUnique({
      where: { token },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    if (invitation.status !== InvitationStatus.PENDING) {
      throw new BadRequestException(`Invitation is ${invitation.status.toLowerCase()}`);
    }

    if (new Date() > invitation.expiresAt) {
      await this.prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: InvitationStatus.EXPIRED },
      });
      throw new BadRequestException('Invitation has expired');
    }

    return invitation;
  }

  async acceptInvitation(token: string) {
    return this.prisma.invitation.update({
      where: { token },
      data: { status: InvitationStatus.ACCEPTED },
    });
  }

  async registerInvitedUser(dto: RegisterInvitationDto) {
    const invitation = await this.verifyInvitation(dto.token);

    if ((invitation as any).type === 'THIRD_PARTY' && !dto.companyName) {
      throw new BadRequestException('Company name is required for third-party registration');
    }

    const user = await this.usersService.createUser({
      email: invitation.email || '',
      firstName: dto.firstName,
      lastName: dto.lastName,
      password: dto.password,
      phone: dto.phone || invitation.phone || undefined,
      roles: invitation.roles as UserRole[],
      activeRole: invitation.roles[0] as UserRole,
      companyName: dto.companyName,
      companyAddress: dto.companyAddress,
      taxId: dto.taxId,
      licenseNumber: dto.licenseNumber,
      bankId: dto.bankId,
      branchId: dto.branchId,
      branchName: dto.branchName,
      cityId: dto.cityId,
      cityName: dto.cityName,
      stateName: dto.stateName,
    });

    // Mark invitation as accepted
    await this.acceptInvitation(dto.token);

    // Update user's onboardedBy if valid
    if (invitation.invitedById) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { onboardedById: invitation.invitedById },
      });
    }

    return user;
  }
}
