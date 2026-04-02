import { Controller, Post, Body } from '@nestjs/common';
import { OtpService } from './otp.service';
import { SendOtpDto, VerifyOtpDto } from './otp.dto';
import { Public } from '../../common/decorators/public.decorator';

@Controller('otp')
@Public()
export class OtpController {
    constructor(private readonly otpService: OtpService) { }

    @Post('send')
    async sendOtp(@Body() dto: SendOtpDto) {
        return this.otpService.sendOtp(dto);
    }

    @Post('verify')
    async verifyOtp(@Body() dto: VerifyOtpDto) {
        return this.otpService.verifyOtp(dto);
    }
}
