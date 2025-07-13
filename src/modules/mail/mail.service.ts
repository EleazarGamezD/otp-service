import {Injectable, Logger} from '@nestjs/common';
import {Resend} from 'resend';
import config from '../../core/IConfiguraion/IConfiguration.configuration';
import {OtpEmailTemplateData, TemplateService} from './template.service';

export interface SendOtpEmailOptions {
  to: string;
  code: string;
  projectName: string;
  expirationMinutes?: number;
  customMessage?: string;
  logoUrl?: string;
  footerText?: string;
  contactInfo?: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly configuration = config();
  private resend: Resend;

  constructor(private readonly templateService: TemplateService) {
    this.initializeResend();
  }

  /**
   * Initialize Resend email service
   */
  private initializeResend() {
    try {
      const mailConfig = this.configuration.mailKeys;
      this.resend = new Resend(mailConfig.apiKey);
      this.logger.log('Resend email service initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Resend email service:', error);
    }
  }

  /**
   * Send OTP email using the template system
   */
  async sendOTPEmail(options: SendOtpEmailOptions): Promise<boolean> {
    try {
      const {
        to,
        code,
        projectName,
        expirationMinutes = 5,
        customMessage,
        logoUrl,
        footerText,
        contactInfo
      } = options;

      // Format expiration time
      const expirationTime = expirationMinutes === 1
        ? '1 minute'
        : `${expirationMinutes} minutes`;

      // Prepare template data
      const templateData: OtpEmailTemplateData = {
        projectName,
        otpCode: code,
        expirationTime,
        customMessage,
        logoUrl,
        footerText,
        contactInfo
      };

      // Render the email HTML
      const htmlContent = this.templateService.renderOtpEmail(templateData);

      // Send email using Resend
      const result = await this.resend.emails.send({
        from: this.configuration.mailKeys.fromEmail,
        to: [to],
        subject: `${projectName} - Your OTP Code`,
        html: htmlContent
      });

      if (result.error) {
        this.logger.error('Failed to send OTP email:', result.error);
        return false;
      }

      this.logger.log(`OTP email sent successfully to ${to} for project ${projectName}`);
      return true;

    } catch (error) {
      this.logger.error('Error sending OTP email:', error);
      return false;
    }
  }

  /**
   * Send OTP email with backward compatibility (simple interface)
   */
  async sendOTPEmailSimple(to: string, code: string, projectName: string): Promise<boolean> {
    return this.sendOTPEmail({
      to,
      code,
      projectName
    });
  }

  /**
   * Get template data structure for API documentation
   */
  getTemplateStructure(): object {
    return this.templateService.getTemplateDataStructure();
  }
}
