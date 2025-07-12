import { Process, Processor } from '@nestjs/bullmq';
import { Job } from 'bullmq';

@Processor('otp')
export class OtpProcessor {
  @Process('send-otp')
  async handleSendOtp(job: Job) {
    const { target, code, channel } = job.data;
    console.log(`Sending OTP ${code} via ${channel} to ${target}`);
    // Aquí se invocaría mailService o whatsappService real
  }
}
