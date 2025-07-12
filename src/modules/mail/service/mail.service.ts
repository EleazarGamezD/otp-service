import {IEmailTemplate} from '@app/core/interfaces/clients/client.interface';
import {IConfiguration} from '@app/core/interfaces/configuration/configuration.interface';
import {Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';

@Injectable()
export class MailService {
  constructor(private configService: ConfigService) { }

  async sendOTPEmail(to: string, code: string, template?: IEmailTemplate, expirationMinutes?: number) {
    const mailConfig = this.configService.get<IConfiguration['mailKeys']>('mailKeys');

    // Use custom template if provided, otherwise use default
    const emailTemplate = template || {
      subject: 'Tu código de verificación',
      body: '<h2>Código de verificación</h2><p>Tu código es: <strong>{{code}}</strong></p><p>Este código expira en {{expirationMinutes}} minutos.</p>'
    };

    // Replace template placeholders
    const subject = emailTemplate.subject.replace('{{code}}', code);
    let body = emailTemplate.body.replace(/\{\{code\}\}/g, code);

    // Replace expiration minutes placeholder
    if (expirationMinutes !== undefined) {
      body = body.replace(/\{\{expirationMinutes\}\}/g, expirationMinutes.toString());
    }

    console.log(`[MAIL] Sending OTP to ${to}`);
    console.log(`[MAIL] Subject: ${subject}`);
    console.log(`[MAIL] Body: ${body}`);
    console.log(`[MAIL] Using service URL: ${mailConfig?.host}`);
    console.log(`[MAIL] OTP expires in ${expirationMinutes || 'default'} minutes`);

    // Aquí implementarías la lógica real para enviar el email
    // usando mailConfig.host, subject y body
  }
}
