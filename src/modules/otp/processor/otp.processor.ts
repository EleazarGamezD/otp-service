import {OtpChannel} from '@app/core/enums/otp/channel.enum';
import {MailService} from '@mail/service/mail.service';
import {Processor, WorkerHost} from '@nestjs/bullmq';
import {Injectable, Logger} from '@nestjs/common';
import {WhatsappService} from '@whatsapp/service/whatsapp.service';
import {Job} from 'bullmq';

@Injectable()
@Processor('otp')
export class OtpProcessor extends WorkerHost {
  private readonly logger = new Logger(OtpProcessor.name);

  constructor(
    private readonly mailService: MailService,
    private readonly whatsappService: WhatsappService,
  ) {
    super();
  }

  async process(job: Job): Promise<void> {
    const {target, code, channel, projectId, projectData} = job.data;

    this.logger.log(`Processing OTP job: ${job.name}`);
    this.logger.log(`Sending OTP via ${channel} to ${target} for project ${projectId}`);

    try {
      if (channel === OtpChannel.EMAIL) {
        await this.mailService.sendOTPEmail(
          target,
          code,
          projectData.emailTemplate,
          projectData.isProduction
        );
      } else if (channel === OtpChannel.WHATSAPP) {
        await this.whatsappService.sendOTPWhatsApp(
          target,
          code,
          projectData.whatsappTemplate,
          projectData.isProduction
        );
      }
      this.logger.log(`OTP sent successfully to ${target} via ${channel}`);
    } catch (error) {
      this.logger.error(`Failed to send OTP to ${target} via ${channel}:`, error);
      throw error;
    }
  }
}
