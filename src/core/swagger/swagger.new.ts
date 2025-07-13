import {INestApplication} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {DocumentBuilder, SwaggerModule} from '@nestjs/swagger';

export function setupSwagger(app: INestApplication) {
    const configService = app.get(ConfigService);
    const port = configService.get<number>('port') || 3000;

    // =============================================================================
    // PUBLIC API DOCUMENTATION (No Authentication Required)
    // =============================================================================
    const publicConfig = new DocumentBuilder()
        .setTitle('OTP Service - Public API')
        .setDescription(
            '🔐 **OTP Service Public API**\n\n' +
            'This is the public API for OTP generation and verification.\n\n' +
            '**Available Operations:**\n' +
            '• Generate and send OTP codes\n' +
            '• Verify OTP codes\n' +
            '• Health check endpoints\n\n' +
            '**Authentication:**\n' +
            'Requires a valid API key in the `x-api-key` header.\n\n' +
            '**Channels Supported:**\n' +
            '• Email (via Resend)\n' +
            '• WhatsApp\n\n' +
            '📧 **Contact:** For API keys and support, contact the administrator.',
        )
        .setVersion('1.0')
        .addTag('OTP', 'One-Time Password operations')
        .addTag('Server Health', 'Health check endpoints')
        .addServer(`http://localhost:${port}`, 'Local Development Server')
        .addApiKey(
            {
                type: 'apiKey',
                name: 'x-api-key',
                in: 'header',
                description: 'API Key for client authentication'
            },
            'api-key'
        )
        .build();

    const publicDocument = SwaggerModule.createDocument(app, publicConfig, {
        include: [], // We'll filter by tags
        operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
    });

    // Filter only public endpoints
    const publicTags = ['OTP', 'Server Health'];
    publicDocument.paths = Object.fromEntries(
        Object.entries(publicDocument.paths).filter(([path, pathObject]: [string, any]) =>
            Object.values(pathObject).some((operation: any) =>
                operation.tags?.some((tag: string) => publicTags.includes(tag))
            )
        )
    );

    SwaggerModule.setup('api-docs', app, publicDocument, {
        customSiteTitle: 'OTP Service - Public API',
        customfavIcon: '🔐',
        customCss: `
      .swagger-ui .topbar { display: none; }
      .swagger-ui .info .title { color: #2563eb; }
      .swagger-ui .scheme-container { background: #f8fafc; border: 1px solid #e2e8f0; }
    `,
    });

    // =============================================================================
    // ADMIN API DOCUMENTATION (Authentication Required)
    // =============================================================================
    const adminConfig = new DocumentBuilder()
        .setTitle('OTP Service - Admin Panel')
        .setDescription(
            '🛠️ **OTP Service Admin Panel**\n\n' +
            'This is the administrative interface for managing OTP clients and system configuration.\n\n' +
            '**Admin Operations:**\n' +
            '• Client management (create, update, delete)\n' +
            '• Token allocation and monitoring\n' +
            '• Email template configuration\n' +
            '• System health monitoring\n' +
            '• Email testing tools\n\n' +
            '**Security:**\n' +
            'This panel requires admin credentials and should only be accessed by authorized personnel.\n\n' +
            '⚠️ **Warning:** These endpoints can modify system configuration and client data.',
        )
        .setVersion('1.0')
        .addTag('Client Management', 'Manage OTP service clients')
        .addTag('Mail Testing', 'Email system testing and debugging')
        .addTag('Server Health', 'Health check endpoints')
        .addServer(`http://localhost:${port}`, 'Local Development Server')
        .addBasicAuth(
            {
                type: 'http',
                scheme: 'basic',
                description: 'Admin credentials required'
            },
            'admin-auth'
        )
        .build();

    const adminDocument = SwaggerModule.createDocument(app, adminConfig, {
        include: [], // We'll filter by tags
        operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
    });

    // Filter only admin endpoints
    const adminTags = ['Client Management', 'Mail Testing', 'Server Health'];
    adminDocument.paths = Object.fromEntries(
        Object.entries(adminDocument.paths).filter(([path, pathObject]: [string, any]) =>
            Object.values(pathObject).some((operation: any) =>
                operation.tags?.some((tag: string) => adminTags.includes(tag))
            )
        )
    );

    SwaggerModule.setup('admin-docs', app, adminDocument, {
        customSiteTitle: 'OTP Service - Admin Panel',
        customfavIcon: '🛠️',
        customCss: `
      .swagger-ui .topbar { display: none; }
      .swagger-ui .info .title { color: #dc2626; }
      .swagger-ui .scheme-container { background: #fef2f2; border: 1px solid #fecaca; }
      .swagger-ui .info .description { background: #fff7ed; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b; }
    `,
        swaggerOptions: {
            persistAuthorization: true,
        },
    });
}
