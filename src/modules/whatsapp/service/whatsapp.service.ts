import {IWhatsAppTemplate} from '@app/core/interfaces/clients/client.interface';
import {IConfiguration} from '@app/core/interfaces/configuration/configuration.interface';
import {Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';

@Injectable()
export class WhatsappService {
  constructor(private configService: ConfigService) { }

  async sendOTPWhatsApp(to: string, code: string, template?: IWhatsAppTemplate, expirationMinutes?: number) {
    const whatsappConfig = this.configService.get<IConfiguration['whatsappKeys']>('whatsappKeys');

    // Use custom template if provided, otherwise use default
    const whatsappTemplate = template || {
      message: 'Tu código de verificación es: {{code}}. Este código expira en {{expirationMinutes}} minutos.'
    };

    // Replace template placeholders
    let message = whatsappTemplate.message.replace(/\{\{code\}\}/g, code);

    // Replace expiration minutes placeholder
    if (expirationMinutes !== undefined) {
      message = message.replace(/\{\{expirationMinutes\}\}/g, expirationMinutes.toString());
    }

    console.log(`[WHATSAPP] Sending OTP to ${to}`);
    console.log(`[WHATSAPP] Message: ${message}`);
    console.log(`[WHATSAPP] Using API URL: ${whatsappConfig?.apiUrl}`);
    console.log(`[WHATSAPP] Using API Key: ${whatsappConfig?.apiKey?.substring(0, 10)}...`);
    console.log(`[WHATSAPP] OTP expires in ${expirationMinutes || 'default'} minutes`);

    // Aquí implementarías la lógica real para enviar el WhatsApp
    // usando whatsappConfig.apiUrl, whatsappConfig.apiKey y message
  }
}
