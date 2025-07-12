# Configuración del Proyecto OTP Service

## Estructura de Configuración

La configuración del proyecto está organizada en objetos separados por funcionalidad, usando interfaces TypeScript para mayor seguridad de tipos.

### Archivo: `src/core/IConfiguraion/configuration.ts`

```typescript
export default (): IConfiguration => ({
    port: process.env.PORT ? parseInt(process.env.PORT, 10) : undefined,
    mongoUri: process.env.MONGO_URI,
    appName: process.env.APP_NAME,
    version: process.env.VERSION,
    logger: process.env.LOGGER,
    nodeEnv: process.env.NODE_ENV,
    vercelDeploy: process.env.VERCEL_DEPLOY === 'true',
    redisKeys: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : undefined,
    },
    otpKeys: {
        queueName: process.env.OTP_QUEUE_NAME,
        expiration: process.env.OTP_EXPIRATION ? parseInt(process.env.OTP_EXPIRATION, 10) : undefined,
    },
    rateLimitKeys: {
        windowMs: process.env.RATE_LIMIT_WINDOW_MS ? parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) : undefined,
        maxRequests: process.env.RATE_LIMIT_MAX_REQUESTS ? parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) : undefined,
    },
    mailKeys: {
        from: process.env.MAIL_FROM,
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT ? parseInt(process.env.MAIL_PORT, 10) : undefined,
        secure: process.env.MAIL_SECURE === 'true',
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    },
    whatsappKeys: {
        apiUrl: process.env.WHATSAPP_API_URL,
        apiKey: process.env.WHATSAPP_API_KEY,
    },
    securityKeys: {
        apiKeyHeader: process.env.API_KEY_HEADER,
    },
});
```

### Interfaces de Configuración

```typescript
export interface IConfiguration {
    port: number | undefined;
    mongoUri: string | undefined;
    appName: string | undefined;
    version: string | undefined;
    logger: string | undefined;
    nodeEnv: string | undefined;
    vercelDeploy: boolean | undefined;
    redisKeys: IRedisKeys;
    otpKeys: IOtpKeys;
    rateLimitKeys: IRateLimitKeys;
    mailKeys: IMailKeys;
    whatsappKeys: IWhatsappKeys;
    securityKeys: ISecurityKeys;
}
```

## Variables de Entorno

Todas las variables están organizadas en el archivo `.env`:

### Aplicación
- `PORT=3000` - Puerto de la aplicación
- `APP_NAME=OTP Service` - Nombre de la aplicación
- `VERSION=1.0.0` - Versión de la aplicación
- `LOGGER=console` - Tipo de logger
- `NODE_ENV=development` - Entorno de ejecución
- `VERCEL_DEPLOY=false` - Si está desplegado en Vercel

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
- `MAIL_FROM=your-email@example.com` - Dirección de correo remitente
- `MAIL_HOST=smtp.example.com` - Host del servidor SMTP
- `MAIL_PORT=587` - Puerto del servidor SMTP
- `MAIL_SECURE=true` - Si usar conexión segura
- `MAIL_USER=your-username` - Usuario para autenticación SMTP
- `MAIL_PASS=your-password` - Contraseña para autenticación SMTP

### WhatsApp
- `WHATSAPP_API_URL=http://localhost:3002` - URL de la API de WhatsApp
- `WHATSAPP_API_KEY=your-whatsapp-api-key` - Clave API de WhatsApp

### Seguridad
- `API_KEY_HEADER=x-api-key` - Header para la API Key

## Cómo Usar la Configuración

### 1. Importar la Configuración Directamente

```typescript
import config from '@config/configuration';

@Injectable()
export class MiServicio {
    private readonly configuration = config();

    miMetodo() {
        // Acceder a la configuración completa
        const redisHost = this.configuration.redisKeys.host;
        const otpExpiration = this.configuration.otpKeys.expiration;
        const mailFrom = this.configuration.mailKeys.from;
    }
}
```

### 2. Usando ConfigService de NestJS

```typescript
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MiServicio {
    constructor(private readonly configService: ConfigService) {}

    miMetodo() {
        const port = this.configService.get<number>('port');
        const mongoUri = this.configService.get<string>('mongoUri');
        const redisHost = this.configService.get<string>('redisKeys.host');
    }
}
```

## Ejemplos de Uso

### Ejemplo 1: Servicio de Conexión a Base de Datos

```typescript
import config from '@config/configuration';

@Injectable()
export class DatabaseService {
    private readonly configuration = config();

    async conectarBaseDatos() {
        const mongoUri = this.configuration.mongoUri;
        const appName = this.configuration.appName;
        
        if (!mongoUri) {
            throw new Error('MongoDB URI no está configurada');
        }

        console.log(`Conectando ${appName} a MongoDB: ${mongoUri}`);
        // Lógica de conexión aquí
    }
}
```

### Ejemplo 2: Servicio de Rate Limiting

```typescript
import config from '@config/configuration';

@Injectable()
export class RateLimitService {
    private readonly configuration = config();

    verificarLimites(clienteId: string) {
        const rateConfig = this.configuration.rateLimitKeys;
        
        const ventanaTiempo = rateConfig.windowMs || 60000; // 1 minuto por defecto
        const maxPeticiones = rateConfig.maxRequests || 100; // 100 peticiones por defecto
        
        console.log(`Cliente ${clienteId}: Máximo ${maxPeticiones} peticiones en ${ventanaTiempo}ms`);
        
        // Lógica de verificación de límites aquí
        return {
            permitido: true,
            ventanaTiempo,
            maxPeticiones
        };
    }
}
```

## Paths de TypeScript Configurados

Para facilitar las importaciones, se han configurado los siguientes paths en `tsconfig.json`:

```json
{
  "paths": {
    "@config/*": ["src/core/IConfiguraion/*"],
    "@otp/*": ["src/modules/otp/*"],
    "@mail/*": ["src/modules/mail/*"],
    "@whatsapp/*": ["src/modules/whatsapp/*"],
    "@auth/*": ["src/modules/auth/*"],
    "@schemas/*": ["src/core/database/schemas/*"]
  }
}
```

## Ventajas de esta Estructura

1. **Organización**: Las variables están agrupadas lógicamente por funcionalidad
2. **Type Safety**: TypeScript proporciona autocompletado y validación de tipos
3. **Centralización**: Toda la configuración está en un lugar
4. **Flexibilidad**: Permite `undefined` para variables opcionales
5. **Fácil mantenimiento**: Cambios en un solo archivo
6. **Reutilización**: Se puede importar en cualquier parte del código
7. **Paths simplificados**: Importaciones más limpias usando los paths configurados

## Instalación y Configuración

1. Copia el archivo `.env.example` a `.env` y ajusta los valores según tu entorno
2. Todas las variables son opcionales y pueden ser `undefined`
3. El sistema funcionará sin variables de entorno, pero es recomendable configurarlas
4. Para usar en producción, asegúrate de configurar todas las variables necesarias

## Notas Importantes

- ⚠️ **Sin valores por defecto**: La configuración no tiene valores por defecto, depende completamente del archivo `.env`
- ⚠️ **Validación**: Asegúrate de que las variables críticas estén definidas antes de usar el servicio
- ⚠️ **Seguridad**: Nunca commites el archivo `.env` al repositorio
- ⚠️ **Tipos**: Todas las propiedades pueden ser `undefined`, maneja esto en tu código
- ⚠️ **Imports**: Usa los paths configurados (`@config/*`, `@otp/*`, etc.) para importaciones más limpias

## Estructura de Archivos

```
src/
├── core/
│   ├── IConfiguraion/
│   │   ├── configuration.ts
│   │   └── ...
│   └── interfaces/
│       └── configuration/
│           └── configuration.interface.ts
├── modules/
│   ├── otp/
│   ├── mail/
│   ├── whatsapp/
│   └── auth/
└── ...
```

Esta estructura permite un manejo organizado y escalable de la configuración del proyecto OTP
