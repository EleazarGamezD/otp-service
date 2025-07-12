import {InjectQueue} from '@nestjs/bullmq';
import {Injectable} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Queue} from 'bullmq';
import {Model} from 'mongoose';

import {OTP} from '../../../core/database/schemas/otp/otp.schema';

@Injectable()
export class OtpService {


  constructor(
    @InjectModel(OTP.name) private otpModel: Model<OTP>,
    @InjectQueue('otp') private otpQueue: Queue,
  ) { }

  async generateOTP(target: string, channel: 'email' | 'whatsapp') {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expirationTime = this.configuration.otpKeys.expiration;
    const expiresAt = new Date(Date.now() + expirationTime * 1000);

    await this.otpModel.create({code, target, channel, expiresAt});
    await this.otpQueue.add('send-otp', {target, code, channel});

    return {
      message: 'OTP encolado',
      expiresIn: expirationTime
    };
  }

  async verifyOTP(target: string, code: string) {
    const record = await this.otpModel.findOne({target, code, verified: false});
    if (!record) return {valid: false, reason: 'Invalid code'};
    if (new Date() > record.expiresAt) return {valid: false, reason: 'Expired code'};
    record.verified = true;
    await record.save();
    return {valid: true};
  }
}
