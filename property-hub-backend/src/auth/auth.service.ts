import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../database/prisma.service';
import * as bcrypt from 'bcrypt';
import { UserRole } from '../common/enums/role.enum';
import { LoginDto, LoginOtpDto, ResetPasswordDto } from './auth.dto';
import { OtpService } from '../modules/otp/otp.service';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private otpService: OtpService,
    ) { }

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });

        if (user && user.passwordHash) {

            const isMatch = await bcrypt.compare(pass, user.passwordHash);
            if (isMatch) {
                const { passwordHash, ...result } = user;
                return result;
            }
        }
        return null;
    }

    async login(loginDto: LoginDto) {
        let user = await this.validateUser(loginDto.email, loginDto.password);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        return this.generateToken(user);
    }

    async loginWithOtp(dto: LoginOtpDto) {
        // 1. Verify OTP
        await this.otpService.verifyOtp({
            phone: dto.phone,
            email: dto.email,
            code: dto.code,
        });

        // 2. Find user
        const user = await this.prisma.user.findFirst({
            where: {
                OR: [
                    dto.phone ? { phone: dto.phone } : null,
                    dto.email ? { email: dto.email } : null,
                ].filter(Boolean) as any,
            },
        });

        if (!user) {
            throw new UnauthorizedException('User not found. Please enquiry or register first.');
        }


        return this.generateToken(user);
    }

    private async generateToken(user: any) {
        // Ensure user has an activeRole to prevent redirection/authorization issues
        let effectiveActiveRole = user.activeRole;
        if (!effectiveActiveRole && user.roles && user.roles.length > 0) {
            effectiveActiveRole = user.roles[0];
            // Optionally persist it
            await this.prisma.user.update({
                where: { id: user.id },
                data: { activeRole: effectiveActiveRole as UserRole },
            });
            user.activeRole = effectiveActiveRole;
        }

        const payload = {
            sub: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            roles: user.roles,
            activeRole: effectiveActiveRole,
        };

        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                roles: user.roles,
                activeRole: effectiveActiveRole,
            },
        };
    }

    async switchRole(userId: string, newRole: string) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user || (!user.roles.includes(newRole as UserRole) && user.activeRole !== newRole)) {
            // Need to handle case where they might have newRole in roles (it's stored as JSON array or explicit string)
            throw new UnauthorizedException('Role not assigned to user');
        }

        const updatedUser = await this.prisma.user.update({
            where: { id: userId },
            data: { activeRole: newRole as UserRole },
        });

        const payload = {
            sub: updatedUser.id,
            email: updatedUser.email,
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName,
            roles: updatedUser.roles,
            activeRole: updatedUser.activeRole,
        };

        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: updatedUser.id,
                email: updatedUser.email,
                firstName: updatedUser.firstName,
                lastName: updatedUser.lastName,
                roles: updatedUser.roles,
                activeRole: updatedUser.activeRole,
            },
        };
    }

    async resetPassword(dto: ResetPasswordDto) {
        // 1. Verify OTP
        await this.otpService.verifyOtp({
            phone: dto.phone,
            email: dto.email,
            code: dto.code,
        });

        // 2. Find user
        const user = await this.prisma.user.findFirst({
            where: {
                OR: [
                    dto.phone ? { phone: dto.phone } : null,
                    dto.email ? { email: dto.email } : null,
                ].filter(Boolean) as any,
            },
        });

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        // 3. Update password
        const passwordHash = await bcrypt.hash(dto.newPassword, 10);
        await this.prisma.user.update({
            where: { id: user.id },
            data: { passwordHash },
        });

        return { success: true, message: 'Password reset successfully' };
    }
}
