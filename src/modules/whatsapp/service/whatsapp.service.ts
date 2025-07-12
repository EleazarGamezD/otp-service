import {IWhatsAppTemplate} from '@app/core/interfaces/clients/client.interface';
import {IConfiguration} from '@app/core/interfaces/configuration/configuration.interface';
import {Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';

@Injectable()
export class WhatsappService {
  constructor(private configService: ConfigService) { }

  async sendOTPWhatsApp(to: string, code: string, template?: IWhatsAppTemplate) {
    const whatsappConfig = this.configService.get<IConfiguration['whatsappKeys']>('whatsappKeys');

    // Use custom template if provided, otherwise use default
    const whatsappTemplate = template || {
      message: 'Tu código de verificación es: {{code}}. Este código expira en 15 minutos.'
    };

    // Replace template placeholders
    const message = whatsappTemplate.message.replace(/\{\{code\}\}/g, code);

    console.log(`[WHATSAPP] Sending OTP to ${to}`);
    console.log(`[WHATSAPP] Message: ${message}`);
    console.log(`[WHATSAPP] Using API URL: ${whatsappConfig?.apiUrl}`);
    console.log(`[WHATSAPP] Using API Key: ${whatsappConfig?.apiKey?.substring(0, 10)}...`);

    // Aquí implementarías la lógica real para enviar el WhatsApp
    // usando whatsappConfig.apiUrl, whatsappConfig.apiKey y message
  }
}
