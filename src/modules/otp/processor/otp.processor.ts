import {Processor, WorkerHost} from '@nestjs/bullmq';
import {Job} from 'bullmq';

@Processor('otp-queue')
export class OtpProcessor extends WorkerHost {
  async process(job: Job): Promise<void> {
    const {target, code, channel} = job.data;

    console.log(`Processing OTP job: ${job.name}`);
    console.log(`Sending OTP ${code} via ${channel} to ${target}`);

    // Aquí se invocaría mailService o whatsappService real
    // Ejemplo:
    // if (channel === 'email') {
    //   await this.mailService.sendOtpEmail(target, code);
    // } else if (channel === 'whatsapp') {
    //   await this.whatsappService.sendOtpWhatsapp(target, code);
    // }
  }
}
