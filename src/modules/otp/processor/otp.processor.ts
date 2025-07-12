import {OtpChannel} from '@app/core/enums/otp/channel.enum';
import {MailService} from '@mail/service/mail.service';
import {Processor, WorkerHost} from '@nestjs/bullmq';
import {Injectable} from '@nestjs/common';
import {WhatsappService} from '@whatsapp/service/whatsapp.service';
import {Job} from 'bullmq';

@Injectable()
@Processor('otp-queue')
export class OtpProcessor extends WorkerHost {
  constructor(
    private readonly mailService: MailService,
    private readonly whatsappService: WhatsappService,
  ) {
    super();
  }

  async process(job: Job): Promise<void> {
    const {target, code, channel, clientId, emailTemplate, whatsappTemplate} = job.data;

    console.log(`Processing OTP job: ${job.name}`);
    console.log(`Sending OTP ${code} via ${channel} to ${target} for client ${clientId}`);

    try {
      if (channel === OtpChannel.EMAIL) {
        await this.mailService.sendOTPEmail(target, code, emailTemplate);
      } else if (channel === OtpChannel.WHATSAPP) {
        await this.whatsappService.sendOTPWhatsApp(target, code, whatsappTemplate);
      }
      console.log(`OTP sent successfully to ${target} via ${channel}`);
    } catch (error) {
      console.error(`Failed to send OTP to ${target} via ${channel}:`, error);
      throw error;
    }
  }
}
