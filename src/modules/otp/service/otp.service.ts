import {OtpChannel} from '@app/core/enums/otp/channel.enum';
import {IConfiguration} from '@app/core/interfaces/configuration/configuration.interface';
import {IOtpGenerateResponse, IOtpVerifyResponse} from '@app/core/interfaces/otp/otp.interface';
import {InjectQueue} from '@nestjs/bullmq';
import {Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {InjectModel} from '@nestjs/mongoose';
import {Queue} from 'bullmq';
import {Model} from 'mongoose';
import {OTP} from '../../../core/database/schemas/otp/otp.schema';

@Injectable()
export class OtpService {
  constructor(
    @InjectModel(OTP.name) private otpModel: Model<OTP>,
    @InjectQueue('otp') private otpQueue: Queue,
    private configService: ConfigService,
  ) { }

  async generateOTP(target: string, channel: OtpChannel): Promise<IOtpGenerateResponse> {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const otpConfig = this.configService.get<IConfiguration['otpKeys']>('otpKeys');
    const expirationTime = otpConfig?.expiration || 45;
    const expiresAt = new Date(Date.now() + expirationTime * 1000);

    await this.otpModel.create({code, target, channel, expiresAt});
    await this.otpQueue.add('send-otp', {target, code, channel});

    return {
      message: 'OTP encolado',
      expiresIn: expirationTime
    };
  }

  async verifyOTP(target: string, code: string): Promise<IOtpVerifyResponse> {
    const record = await this.otpModel.findOne({target, code, verified: false});
    if (!record) return {valid: false, reason: 'Invalid code'};
    if (new Date() > record.expiresAt) return {valid: false, reason: 'Expired code'};
    record.verified = true;
    await record.save();
    return {valid: true};
  }
}
