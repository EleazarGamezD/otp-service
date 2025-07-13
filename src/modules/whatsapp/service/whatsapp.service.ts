import {IConfiguration} from '@app/core/interfaces/configuration/configuration.interface';
import {IWhatsAppTemplate} from '@app/core/interfaces/projects/project.interface';
import {Injectable, Logger} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';

@Injectable()
export class WhatsappService {
  private readonly logger = new Logger(WhatsappService.name);

  constructor(private configService: ConfigService) { }

  async sendOTPWhatsApp(to: string, code: string, template?: IWhatsAppTemplate, isProduction?: boolean) {
    const whatsappConfig = this.configService.get<IConfiguration['whatsappKeys']>('whatsappKeys');

    // Use custom template if provided, otherwise use default
    const whatsappTemplate = template || {
      message: 'Your verification code is: {{code}}. This code expires in a few minutes.'
    };

    // Replace template placeholders
    const message = whatsappTemplate.message.replace(/\{\{code\}\}/g, code);

    this.logger.log(`Sending WhatsApp OTP to ${to}`);
    this.logger.debug(`Message content: ${message}`);
    this.logger.debug(`Production mode: ${isProduction}`);

    if (whatsappConfig?.apiUrl) {
      this.logger.debug(`Using WhatsApp API URL: ${whatsappConfig.apiUrl}`);
    }

    // Here you would implement the actual logic to send the WhatsApp message
    // using whatsappConfig.apiUrl, whatsappConfig.apiKey and message

    if (!isProduction) {
      this.logger.warn('Development mode: WhatsApp message not actually sent');
    }
  }
}
