# Configuración del Proyecto OTP Service

## Estructura de Configuración

La configuración del proyecto está organizada en objetos separados por funcionalidad, siguiendo el patrón que solicitaste:

### Archivo: `src/core/IConfiguraion/IConfiguration.configuration.ts`

```typescript
export type IConfiguration = {
  port: number;
  mongoUri: string;
  redisKeys: {
    host: string;
    port: number;
  };
  otpKeys: {
    queueName: string;
    expiration: number;
  };
  rateLimitKeys: {
    windowMs: number;
    maxRequests: number;
  };
  mailKeys: {
    serviceUrl: string;
  };
  whatsappKeys: {
    apiUrl: string;
    apiKey: string;
  };
  securityKeys: {
    apiKeyHeader: string;
  };
};
```

## Variables de Entorno

Todas las variables están organizadas en el archivo `.env`:

### Aplicación
- `PORT=3000` - Puerto de la aplicación

### Base de Datos
- `MONGO_URI=mongodb://localhost:27017/otp-service` - URI de MongoDB

### Redis
- `REDIS_HOST=localhost` - Host de Redis
- `REDIS_PORT=6379` - Puerto de Redis

### OTP
- `OTP_QUEUE_NAME=otp-queue` - Nombre de la cola OTP
- `OTP_EXPIRATION=45` - Tiempo de expiración en segundos

### Rate Limiting
- `RATE_LIMIT_WINDOW_MS=60000` - Ventana de tiempo en milisegundos
- `RATE_LIMIT_MAX_REQUESTS=5` - Máximo de requests por ventana

### Mail Service
- `MAIL_SERVICE_URL=http://localhost:3001` - URL del servicio de email

### WhatsApp
- `WHATSAPP_API_URL=http://localhost:3002` - URL de la API de WhatsApp
- `WHATSAPP_API_KEY=your-whatsapp-api-key` - Clave API de WhatsApp

### Seguridad
- `API_KEY_HEADER=x-api-key` - Header para la API Key

## Cómo Usar la Configuración

### 1. Inyectar el ConfigurationService

```typescript
import { Injectable } from '@nestjs/common';
import { ConfigurationService } from '../../core/IConfiguraion';

@Injectable()
export class MiServicio {
  constructor(private readonly configService: ConfigurationService) {}

  miMetodo() {
    // Acceder a la configuración completa
    const config = this.configService.config;
    
    // Acceder a configuraciones específicas
    const whatsappUrl = config.whatsappKeys.apiUrl;
    const redisHost = config.redisKeys.host;
    const otpExpiration = config.otpKeys.expiration;
  }
}
```

### 2. Ejemplos de Uso

#### En un servicio de WhatsApp:
```typescript
async sendMessage() {
  const whatsappConfig = this.configService.config.whatsappKeys;
  // Usar whatsappConfig.apiUrl y whatsappConfig.apiKey
}
```

#### En un servicio de OTP:
```typescript
async generateOTP() {
  const expiration = this.configService.config.otpKeys.expiration;
  const expiresAt = new Date(Date.now() + expiration * 1000);
}
```

#### En middleware de Rate Limiting:
```typescript
use(req: Request, res: Response, next: NextFunction) {
  const rateConfig = this.configService.config.rateLimitKeys;
  // Usar rateConfig.windowMs y rateConfig.maxRequests
}
```

## Ventajas de esta Estructura

1. **Organización**: Las variables están agrupadas lógicamente
2. **Type Safety**: TypeScript te ayuda con autocompletado y validación
3. **Centralización**: Toda la configuración está en un lugar
4. **Fácil mantenimiento**: Cambios en un solo archivo
5. **Reutilización**: El servicio se puede inyectar en cualquier parte
6. **Valores por defecto**: Si no hay variable de entorno, usa valores predeterminados

## Instalación y Configuración

1. Copia el archivo `.env` y ajusta los valores según tu entorno
2. El `ConfigurationModule` es global, se puede usar en cualquier módulo
3. Inyecta `ConfigurationService` donde necesites acceder a la configuración
