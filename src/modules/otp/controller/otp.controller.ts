import {Body, Controller, Post, Req, UseGuards} from '@nestjs/common';
import {ApiKey} from '../../auth/decorator/api-key.decorator';
import {ApiKeyGuard} from '../../auth/guard/api-key.guard';
import {OtpService} from '../service/otp.service';

@Controller('otp')
@UseGuards(ApiKeyGuard)
export class OtpController {
  constructor(private readonly otpService: OtpService) { }

  @Post('send')
  @ApiKey()
  async sendOtp(@Body() dto: {target: string; channel: 'email' | 'whatsapp'}, @Req() req) {
    return this.otpService.generateOTP(dto.target, dto.channel);
  }

  @Post('verify')
  @ApiKey()
  async verifyOtp(@Body() dto: {target: string; code: string}) {
    return this.otpService.verifyOTP(dto.target, dto.code);
  }
}
