import {IConfiguration} from '@app/core/IConfiguraion/configuration';
import {Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';

@Injectable()
export class MailService {
  constructor(private configService: ConfigService) { }

  async sendOTPEmail(to: string, code: string) {
    const mailConfig = this.configService.get<IConfiguration['mailKeys']>('mailKeys');

    console.log(`[MAIL] OTP ${code} enviado a ${to}`);
    console.log(`[MAIL] Using service URL: ${mailConfig?.serviceUrl}`);

    // Aquí implementarías la lógica real para enviar el email
    // usando mailConfig.serviceUrl
  }
}
