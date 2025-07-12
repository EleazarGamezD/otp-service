import {IConfiguration} from '@app/core/interfaces/configuration/configuration.interface';
import {Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';

@Injectable()
export class WhatsappService {
  constructor(private configService: ConfigService) { }

  async sendOTPWhatsApp(to: string, code: string) {
    const whatsappConfig = this.configService.get<IConfiguration['whatsappKeys']>('whatsappKeys');

    console.log(`[WHATSAPP] OTP ${code} enviado a ${to}`);
    console.log(`[WHATSAPP] Using API URL: ${whatsappConfig?.apiUrl}`);
    console.log(`[WHATSAPP] Using API Key: ${whatsappConfig?.apiKey?.substring(0, 10)}...`);

    // Aquí implementarías la lógica real para enviar el WhatsApp
    // usando whatsappConfig.apiUrl y whatsappConfig.apiKey
  }
}
