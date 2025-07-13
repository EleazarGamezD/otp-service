import {INestApplication} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {DocumentBuilder, SwaggerModule} from '@nestjs/swagger';

export function setupPublicSwagger(app: INestApplication) {
    const configService = app.get(ConfigService);
    const port = configService.get<number>('port') || 3000;

    const config = new DocumentBuilder()
        .setTitle('OTP Service - Public API')
        .setDescription(
            '🔐 **OTP Service Public API**\n\n' +
            'This is the public API for OTP generation and verification.\n\n' +
            '**Available Operations:**\n' +
            '• Customer registration and authentication\n' +
            '• Generate and send OTP codes\n' +
            '• Verify OTP codes\n' +
            '• Health check endpoints\n\n' +
            '**Authentication:**\n' +
            '• **For OTP Operations:** Requires a valid API key in the `x-api-key` header\n' +
            '• **For Customer Panel:** Requires Bearer token after login\n\n' +
            '**Channels Supported:**\n' +
            '• Email (via Resend)\n' +
            '• WhatsApp\n\n' +
            '📧 **Contact:** For API keys and support, contact the administrator.',
        )
        .setVersion('1.0')
        .addTag('Customer Authentication', 'Customer registration, login and profile management')
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
        .addBearerAuth(
            {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                description: 'JWT token for customer authentication'
            },
            'client-jwt'
        )
        .build();

    const document = SwaggerModule.createDocument(app, config, {
        include: [], // We'll filter by tags
        operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
    });

    // Filter only public endpoints
    const publicTags = ['Customer Authentication', 'OTP', 'Server Health'];
    document.paths = Object.fromEntries(
        Object.entries(document.paths).filter(([path, pathObject]: [string, any]) =>
            Object.values(pathObject).some((operation: any) =>
                operation.tags?.some((tag: string) => publicTags.includes(tag))
            )
        )
    );

    SwaggerModule.setup('api-docs', app, document, {
        customSiteTitle: 'OTP Service - Public API',
        customfavIcon: '🔐',
        customCss: `
      .swagger-ui .topbar { display: none; }
      .swagger-ui .info .title { color: #2563eb; }
      .swagger-ui .scheme-container { background: #f8fafc; border: 1px solid #e2e8f0; }
      .swagger-ui .info .description { background: #f0f9ff; padding: 15px; border-radius: 8px; border-left: 4px solid #2563eb; }
    `,
        swaggerOptions: {
            persistAuthorization: true,
            docExpansion: 'list',
            filter: true,
            showRequestHeaders: true,
        },
    });
}
