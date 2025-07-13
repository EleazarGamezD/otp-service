import {IEmailTemplate} from '@app/core/interfaces/clients/client.interface';
import {IConfiguration} from '@app/core/interfaces/configuration/configuration.interface';
import {Injectable, Logger} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {Resend} from 'resend';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private resend: Resend;

  constructor(private configService: ConfigService) {
    const mailConfig = this.configService.get<IConfiguration['mailKeys']>('mailKeys');

    if (!mailConfig?.resendApiKey) {
      this.logger.warn('Resend API key not found. Email service will not work properly.');
      return;
    }

    this.resend = new Resend(mailConfig.resendApiKey);
    this.logger.log('Resend email service initialized successfully');
  }

  async sendOTPEmail(to: string, code: string, template?: IEmailTemplate, expirationMinutes?: number) {
    try {
      const mailConfig = this.configService.get<IConfiguration['mailKeys']>('mailKeys');

      if (!this.resend) {
        throw new Error('Resend is not initialized. Check your API key configuration.');
      }

      // Use custom template if provided, otherwise use default
      const emailTemplate = template || {
        subject: 'Tu código de verificación',
        body: '<h2>Código de verificación</h2><p>Tu código es: <strong>{{code}}</strong></p><p>Este código expira en {{expirationMinutes}} minutos.</p>'
      };

      // Replace template placeholders
      const subject = emailTemplate.subject.replace(/\{\{code\}\}/g, code);
      let body = emailTemplate.body.replace(/\{\{code\}\}/g, code);

      // Replace expiration minutes placeholder
      if (expirationMinutes !== undefined) {
        body = body.replace(/\{\{expirationMinutes\}\}/g, expirationMinutes.toString());
      }

      this.logger.log(`Sending OTP email to ${to} via Resend`);
      this.logger.debug(`Subject: ${subject}`);
      this.logger.debug(`OTP expires in ${expirationMinutes || 'default'} minutes`);

      const result = await this.resend.emails.send({
        from: mailConfig?.from || 'noreply@eleazargamez.dev',
        to: [to],
        subject: subject,
        html: body,
      });

      this.logger.log(`Email sent successfully to ${to}. Message ID: ${result.data?.id}`);
      return result;

    } catch (error) {
      this.logger.error(`Failed to send OTP email to ${to}:`, {
        error: error.message,
        name: error.name,
        statusCode: error.statusCode || 'unknown',
        details: error
      });
      throw new Error(`Email sending failed: ${error.message || 'Unknown error'}`);
    }
  }

  /**
   * Test email sending - useful for debugging
   */
  async sendTestEmail(to: string): Promise<any> {
    try {
      const mailConfig = this.configService.get<IConfiguration['mailKeys']>('mailKeys');

      if (!this.resend) {
        throw new Error('Resend is not initialized. Check your API key configuration.');
      }

      this.logger.log(`Sending test email to ${to} via Resend`);

      const result = await this.resend.emails.send({
        from: mailConfig?.from as string,
        to: [to],
        subject: 'Prueba de configuración - OTP Service',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">✅ Configuración de Email Exitosa</h2>
            <p>Este es un email de prueba desde tu servicio OTP.</p>
            <p><strong>Servicio:</strong> Resend</p>
            <p><strong>Dominio:</strong> eleazargamez.dev</p>
            <p><strong>Fecha:</strong> ${new Date().toLocaleString()}</p>
            <p style="color: #666; font-size: 12px;">Si recibes este email, la configuración está funcionando perfectamente.</p>
          </div>
        `,
      });

      this.logger.log(`Test email sent successfully to ${to}. Message ID: ${result.data?.id}`);
      return result;

    } catch (error) {
      this.logger.error(`Failed to send test email to ${to}:`, {
        error: error.message,
        name: error.name,
        statusCode: error.statusCode || 'unknown',
        details: error
      });
      throw new Error(`Test email sending failed: ${error.message || 'Unknown error'}`);
    }
  }
}
