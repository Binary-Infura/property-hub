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
        const user = await this.validateUser(loginDto.email, loginDto.password);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const payload = {
            sub: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            roles: user.roles,
            primaryRole: user.primaryRole,
        };

        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                roles: user.roles,
                primaryRole: user.primaryRole,
            },
        };
    }
}
