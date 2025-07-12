import {Injectable} from '@nestjs/common';
import config from '../../../core/IConfiguraion/configuration';

@Injectable()
export class MailService {
  private readonly configuration = config();

  async sendOTPEmail(to: string, code: string) {
    const mailConfig = this.configuration.mailKeys;

    console.log(`[MAIL] OTP ${code} enviado a ${to}`);
    console.log(`[MAIL] Using service URL: ${mailConfig.serviceUrl}`);

    // Aquí implementarías la lógica real para enviar el email
    // usando mailConfig.serviceUrl
  }
}
