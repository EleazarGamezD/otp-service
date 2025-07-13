import {INestApplication} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {DocumentBuilder, SwaggerModule} from '@nestjs/swagger';

export function setupAdminSwagger(app: INestApplication) {
    const configService = app.get(ConfigService);
    const port = configService.get<number>('port') || 3000;

    const config = new DocumentBuilder()
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
        .addTag('Admin Authentication', 'Admin login and token management')
        .addTag('Client Management', 'Manage OTP service clients')
        .addTag('Mail Testing', 'Email system testing and debugging')
        .addTag('Server Health', 'Health check endpoints')
        .addServer(`http://localhost:${port}`, 'Local Development Server')
        .addBearerAuth(
            {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                description: 'JWT token obtained from /admin/auth/login'
            },
            'admin-auth'
        )
        .build();

    const document = SwaggerModule.createDocument(app, config, {
        include: [], // We'll filter by tags
        operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
    });

    // Filter only admin endpoints
    const adminTags = ['Admin Authentication', 'Client Management', 'Mail Testing', 'Server Health'];
    document.paths = Object.fromEntries(
        Object.entries(document.paths).filter(([path, pathObject]: [string, any]) =>
            Object.values(pathObject).some((operation: any) =>
                operation.tags?.some((tag: string) => adminTags.includes(tag))
            )
        )
    );

    SwaggerModule.setup('admin-docs', app, document, {
        customSiteTitle: 'OTP Service - Admin Panel',
        customfavIcon: '🛠️',
        customCss: `
      .swagger-ui .topbar { display: none; }
      .swagger-ui .info .title { color: #dc2626; }
      .swagger-ui .scheme-container { background: #fef2f2; border: 1px solid #fecaca; }
      .swagger-ui .info .description { background: #fff7ed; padding: 15px; border-radius: 8px; border-left: 4px solid #f59e0b; }
      .swagger-ui .authorization__btn { background: #dc2626; border-color: #dc2626; }
      .swagger-ui .authorization__btn:hover { background: #b91c1c; }
    `,
        swaggerOptions: {
            persistAuthorization: true,
            docExpansion: 'list',
            filter: true,
            showRequestHeaders: true,
            displayRequestDuration: true,
        },
    });
}
