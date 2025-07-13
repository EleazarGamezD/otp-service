# OTP Service Project Configuration

> **⚠️ Security Notice**: This document provides generic examples and structure. Always use your own values for environment variables and never commit sensitive configuration to version control.

## Configuration Structure

The project configuration is organized into separate objects by functionality, using TypeScript interfaces for enhanced type safety.

### File: `src/core/IConfiguraion/configuration.ts`

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
        resendApiKey: process.env.RESEND_API_KEY,
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

### Configuration Interfaces

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

export interface IRedisKeys {
    host: string | undefined;
    port: number | undefined;
}

export interface IOtpKeys {
    queueName: string | undefined;
    expiration: number | undefined;
}

export interface IRateLimitKeys {
    windowMs: number | undefined;
    maxRequests: number | undefined;
}

export interface IMailKeys {
    from: string | undefined;
    host: string | undefined;
    port: number | undefined;
    secure: boolean | undefined;
    user: string | undefined;
    pass: string | undefined;
    resendApiKey: string | undefined;
}

export interface IWhatsappKeys {
    apiUrl: string | undefined;
    apiKey: string | undefined;
}

export interface ISecurityKeys {
    apiKeyHeader: string | undefined;
}
```

## Environment Variables

All variables are organized in the `.env` file:

### Application

- `PORT` - Application port (e.g., 3000, 8080)
- `APP_NAME` - Application name for branding
- `VERSION` - Application version for tracking
- `LOGGER` - Logger type configuration
- `NODE_ENV` - Runtime environment (development, production, test)
- `VERCEL_DEPLOY` - Boolean flag for Vercel deployment

### Database

- `MONGO_URI` - MongoDB connection string

### Redis

- `REDIS_HOST` - Redis server hostname
- `REDIS_PORT` - Redis server port

### OTP Configuration

- `OTP_QUEUE_NAME` - Queue name for OTP processing
- `OTP_EXPIRATION` - Code expiration time in seconds

### Rate Limiting

- `RATE_LIMIT_WINDOW_MS` - Time window in milliseconds
- `RATE_LIMIT_MAX_REQUESTS` - Maximum requests per window

### Mail Service

- `MAIL_FROM` - Sender email address
- `MAIL_HOST` - SMTP server hostname
- `MAIL_PORT` - SMTP server port
- `MAIL_SECURE` - Boolean for secure connection
- `MAIL_USER` - SMTP authentication username
- `MAIL_PASS` - SMTP authentication password
- `RESEND_API_KEY` - Resend service API key

### WhatsApp Integration

- `WHATSAPP_API_URL` - WhatsApp API endpoint URL
- `WHATSAPP_API_KEY` - WhatsApp API authentication key

### Security

- `API_KEY_HEADER` - Header name for API key authentication

## How to Use Configuration

### 1. Direct Configuration Import

```typescript
import config from '@config/configuration';

@Injectable()
export class MyService {
    private readonly configuration = config();

    myMethod() {
        // Access complete configuration
        const redisHost = this.configuration.redisKeys.host;
        const otpExpiration = this.configuration.otpKeys.expiration;
        const mailFrom = this.configuration.mailKeys.from;
    }
}
```

### 2. Using NestJS ConfigService

```typescript
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MyService {
    constructor(private readonly configService: ConfigService) {}

    myMethod() {
        const port = this.configService.get<number>('port');
        const mongoUri = this.configService.get<string>('mongoUri');
        const redisHost = this.configService.get<string>('redisKeys.host');
    }
}
```

## Usage Examples

### Example 1: Database Connection Service

```typescript
import config from '@config/configuration';

@Injectable()
export class DatabaseService {
    private readonly configuration = config();

    async connectDatabase() {
        const mongoUri = this.configuration.mongoUri;
        const appName = this.configuration.appName;
        
        if (!mongoUri) {
            throw new Error('MongoDB URI is not configured');
        }

        console.log(`Connecting ${appName} to database...`);
        // Connection logic here
    }
}
```

### Example 2: Rate Limiting Service

```typescript
import config from '@config/configuration';

@Injectable()
export class RateLimitService {
    private readonly configuration = config();

    checkLimits(clientId: string) {
        const rateConfig = this.configuration.rateLimitKeys;
        
        const windowTime = rateConfig.windowMs || 60000; // Default fallback
        const maxRequests = rateConfig.maxRequests || 100; // Default fallback
        
        console.log(`Client ${clientId}: Max ${maxRequests} requests in ${windowTime}ms`);
        
        // Rate limit verification logic here
        return {
            allowed: true,
            windowTime,
            maxRequests
        };
    }
}
```

### Example 3: Email Template Service

```typescript
import config from '@config/configuration';

@Injectable()
export class TemplateService {
    private readonly configuration = config();

    async sendOTPEmail(to: string, otpCode: string) {
        const mailConfig = this.configuration.mailKeys;
        
        if (!mailConfig.resendApiKey) {
            throw new Error('Email service API key is not configured');
        }

        const templateData = {
            projectName: this.configuration.appName || 'Default App Name',
            otpCode,
            expirationTime: `${this.configuration.otpKeys.expiration || 300} seconds`,
            customMessage: 'Please verify your account with the code above.'
        };

        // Email sending logic here
        console.log(`Sending OTP to ${to} using template system`);
    }
}
}
```

## TypeScript Paths Configuration

To facilitate imports, the following paths have been configured in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@config/*": ["src/core/IConfiguraion/*"],
      "@otp/*": ["src/modules/otp/*"],
      "@mail/*": ["src/modules/mail/*"],
      "@whatsapp/*": ["src/modules/whatsapp/*"],
      "@auth/*": ["src/modules/auth/*"],
      "@schemas/*": ["src/core/database/schemas/*"]
    }
  }
}
```

### Clean Import Examples

```typescript
// Instead of relative paths
import config from '../../../core/IConfiguraion/configuration';

// Use clean paths
import config from '@config/configuration';
import { MailService } from '@mail/service/mail.service';
import { OtpService } from '@otp/otp.service';
```

## Template System Configuration

The email template system uses the configuration for dynamic content:

### Template Variables from Configuration

```typescript
const templateData = {
    projectName: config().appName,           // From APP_NAME env var
    otpCode: generatedCode,                  // Generated OTP code
    expirationTime: config().otpKeys.expiration, // From OTP_EXPIRATION env var
    customMessage: userMessage,              // User provided message
    logoUrl: companyLogo,                    // Optional company logo
    footerText: config().appName + ' Team',  // Dynamic footer text
    contactInfo: config().mailKeys.from     // Support contact email
};
```

### Configuration-Driven Email Settings

```typescript
const emailConfig = {
    from: config().mailKeys.from,           // From MAIL_FROM env var
    apiKey: config().mailKeys.resendApiKey, // From RESEND_API_KEY env var
    projectName: config().appName,          // From APP_NAME for branding
};
```

## Advantages of This Structure

1. **Organization**: Variables are logically grouped by functionality
2. **Type Safety**: TypeScript provides autocomplete and type validation
3. **Centralization**: All configuration in one place
4. **Flexibility**: Allows `undefined` for optional variables
5. **Easy Maintenance**: Changes in a single file
6. **Reusability**: Can be imported anywhere in the code
7. **Simplified Paths**: Cleaner imports using configured paths
8. **Template Integration**: Configuration drives template content

## Installation and Setup

1. Copy the `.env.example` file to `.env` and adjust values for your environment
2. All variables are optional and can be `undefined`
3. The system will work without environment variables, but configuration is recommended
4. For production use, ensure all critical variables are configured

## Important Notes

- ⚠️ **No Default Values**: Configuration has no default values, depends entirely on `.env` file
- ⚠️ **Validation**: Ensure critical variables are defined before using the service
- ⚠️ **Security**: Never commit the `.env` file to the repository
- ⚠️ **Types**: All properties can be `undefined`, handle this in your code
- ⚠️ **Imports**: Use configured paths (`@config/*`, `@otp/*`, etc.) for cleaner imports
- ⚠️ **Template System**: Uses configuration for dynamic email content

## File Structure

```
src/
├── core/
│   ├── IConfiguraion/
│   │   ├── configuration.ts           # Main configuration
│   │   └── IConfiguration.configuration.ts # Interfaces
│   └── docs/
│       ├── CONFIGURATION.md           # This file
│       └── CONFIGURACION.md           # Spanish version
├── modules/
│   ├── otp/                          # OTP operations
│   ├── mail/                         # Email services with templates
│   │   ├── service/
│   │   │   ├── mail.service.ts       # Uses mailKeys config
│   │   │   └── template.service.ts   # Template rendering
│   │   └── template/
│   │       └── otp-email.hbs         # Dynamic template
│   ├── whatsapp/                     # WhatsApp integration
│   └── auth/                         # Authentication
└── main.ts                           # App entry point
```

## Configuration Best Practices

### 1. Environment-Specific Files

```bash
# Development environment
.env.development

# Production environment
.env.production

# Testing environment
.env.test
```

### 2. Validation in Services

```typescript
@Injectable()
export class MyService {
    constructor() {
        const config = this.getConfig();
        this.validateConfig(config);
    }

    private validateConfig(config: IConfiguration) {
        if (!config.mongoUri) {
            throw new Error('Database URI is required');
        }
        if (!config.mailKeys.resendApiKey) {
            throw new Error('Email service API key is required');
        }
        // Add more validations as needed
    }
}
```

### 3. Configuration Factory Pattern

```typescript
export const createAppConfig = (): IConfiguration => {
    const config = configuration();
    
    // Add runtime validations
    if (config.nodeEnv === 'production' && !config.mailKeys.resendApiKey) {
        throw new Error('Email API key is required in production');
    }
    
    return config;
};
```

This structure allows for organized and scalable configuration management in the OTP service project.
