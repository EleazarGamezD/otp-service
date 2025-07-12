import {Injectable} from '@nestjs/common';
import config from '../../../core/IConfiguraion/IConfiguration.configuration';

@Injectable()
export class WhatsappService {
  private readonly configuration = config();

  async sendOTPWhatsApp(to: string, code: string) {
    const whatsappConfig = this.configuration.whatsappKeys;

    console.log(`[WHATSAPP] OTP ${code} enviado a ${to}`);
    console.log(`[WHATSAPP] Using API URL: ${whatsappConfig.apiUrl}`);
    console.log(`[WHATSAPP] Using API Key: ${whatsappConfig.apiKey.substring(0, 10)}...`);

    // Aquí implementarías la lógica real para enviar el WhatsApp
    // usando whatsappConfig.apiUrl y whatsappConfig.apiKey
  }
}
