import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../database/prisma.service';
import * as bcrypt from 'bcrypt';
import { UserRole } from '../common/enums/role.enum';
import { LoginDto } from './auth.dto';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) { }

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });

        if (user && user.passwordHash) {
            // Block specific roles from logging in
            if (user.roles && (user.roles.includes(UserRole.VISIT_EXECUTIVE as any) || user.roles.includes(UserRole.BROKER as any))) {
                const blockedRole = user.roles.includes(UserRole.BROKER as any) ? 'Brokers' : 'Visit Executives';
                throw new UnauthorizedException(`${blockedRole} do not have login access`);
            }

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
}
