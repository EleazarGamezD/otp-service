import {OtpChannel} from '@app/core/enums/otp/channel.enum';
import {IConfiguration} from '@app/core/interfaces/configuration/configuration.interface';
import {IOtpGenerateResponse, IOtpVerifyResponse} from '@app/core/interfaces/otp/otp.interface';
import {ClientService} from '@app/modules/clients/service/client.service';
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
    @InjectQueue('otp-queue') private otpQueue: Queue,
    private configService: ConfigService,
    private clientService: ClientService,
  ) { }

  async generateOTP(target: string, channel: OtpChannel, apiKey: string): Promise<IOtpGenerateResponse> {
    // First consume a token for this operation
    const tokenResult = await this.clientService.consumeToken(apiKey);

    if (!tokenResult.canProceed) {
      throw new Error(tokenResult.reason || 'Cannot proceed with OTP generation');
    }

    // Get client info for templates
    const client = await this.clientService.findByApiKey(apiKey);
    if (!client) {
      throw new Error('Client not found');
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const otpConfig = this.configService.get<IConfiguration['otpKeys']>('otpKeys');
    const expirationTime = otpConfig?.expiration || 45;
    const expiresAt = new Date(Date.now() + expirationTime * 1000);

    // Store OTP with client reference
    await this.otpModel.create({
      code,
      target,
      channel,
      expiresAt,
      clientId: (client as any)._id
    });

    // Queue OTP with client template information
    await this.otpQueue.add('send-otp', {
      target,
      code,
      channel,
      clientId: (client as any)._id.toString(),
      emailTemplate: client.emailTemplate,
      whatsappTemplate: client.whatsappTemplate
    });

    return {
      message: 'OTP encolado',
      expiresIn: expirationTime,
      tokensRemaining: tokenResult.tokensRemaining
    };
  }

  async verifyOTP(target: string, code: string, apiKey?: string): Promise<IOtpVerifyResponse> {
    const query: any = {target, code, verified: false};

    // If API key provided, validate it belongs to the same client
    if (apiKey) {
      const client = await this.clientService.findByApiKey(apiKey);
      if (client) {
        query.clientId = client._id;
      }
    }

    const record = await this.otpModel.findOne(query);
    if (!record) return {valid: false, reason: 'Invalid code'};
    if (new Date() > record.expiresAt) return {valid: false, reason: 'Expired code'};

    record.verified = true;
    await record.save();

    return {valid: true};
  }

  async getClientTokenInfo(apiKey: string): Promise<{tokens: number; tokensUsed: number; remainingTokens: number}> {
    const client = await this.clientService.findByApiKey(apiKey);
    if (!client) {
      throw new Error('Client not found');
    }

    return {
      tokens: client.tokens,
      tokensUsed: client.tokensUsed,
      remainingTokens: client.tokens - client.tokensUsed
    };
  }
}
