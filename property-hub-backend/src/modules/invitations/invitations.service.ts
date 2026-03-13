import { Injectable, NotFoundException, BadRequestException, Logger, InternalServerErrorException, HttpException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { MailService } from '../mail/mail.service';
import { WhatsappService } from '../whatsapp/whatsapp.service';
import { ConfigService } from '@nestjs/config';
import { CreateInvitationDto, RegisterInvitationDto } from './invitations.dto';
import * as crypto from 'crypto';
import { InvitationStatus } from '@prisma/client';
import { UsersService } from '../users/users.service';
import { UserRole } from '../../common/enums/role.enum';

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

      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 48); // 48 hours expiry

      const invitation = await this.prisma.invitation.create({
        data: {
          email: dto.email,
          phone: dto.phone,
          roles: dto.roles,
          token,
          invitedById,
          expiresAt,
        },
      });

      const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
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

    const user = await this.usersService.createUser({
      email: invitation.email || '',
      firstName: dto.firstName,
      lastName: dto.lastName,
      password: dto.password,
      phone: dto.phone || invitation.phone || undefined,
      roles: invitation.roles as UserRole[],
      primaryRole: invitation.roles[0] as UserRole,
      companyName: dto.companyName,
      companyAddress: dto.companyAddress,
      taxId: dto.taxId,
      licenseNumber: dto.licenseNumber,
      agencyName: dto.agencyName,
      officeAddress: dto.officeAddress,
      reraNumber: dto.reraNumber,
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
