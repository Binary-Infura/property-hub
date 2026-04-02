import { Controller, Post, Body, HttpCode, HttpStatus, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, LoginOtpDto, ResetPasswordDto } from './auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Login with email and password' })
    @ApiResponse({ status: 200, description: 'Login successful' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @Post('login-otp')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Login with phone/email and OTP' })
    async loginWithOtp(@Body() dto: LoginOtpDto) {
        return this.authService.loginWithOtp(dto);
    }

    @Post('switch-role')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Switch active role and get new token' })
    async switchRole(@Request() req, @Body('activeRole') activeRole: string) {
        return this.authService.switchRole(req.user.userId, activeRole);
    }

    @Post('reset-password')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Reset password with OTP' })
    async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
        return this.authService.resetPassword(resetPasswordDto);
    }
}
