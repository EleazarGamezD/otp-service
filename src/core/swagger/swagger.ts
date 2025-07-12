import {INestApplication} from '@nestjs/common';
import {DocumentBuilder, SwaggerModule} from '@nestjs/swagger';

export function setupSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('OTP Service API')
    .setDescription(
      'OTP Service is a robust microservice for One-Time Password (OTP) generation and verification.\n\n' +
      'This service provides secure OTP delivery through multiple channels including email and WhatsApp.\n\n' +
      'Features include:\n' +
      '• OTP generation with configurable expiration times\n' +
      '• Multi-channel delivery (Email & WhatsApp)\n' +
      '• Rate limiting for security\n' +
      '• API key authentication\n' +
      '• Queue-based message processing\n\n' +
      'Perfect for authentication flows, password resets, and secure verifications.',
    )
    .setVersion('1.0')
    .addTag('OTP', 'One-Time Password operations')
    .addTag('Authentication', 'API key validation')
    .addServer(`http://localhost:${process.env.PORT || 3000}`, 'Local Development Server')
    .addApiKey(
      {
        type: 'apiKey',
        name: 'x-api-key',
        in: 'header',
        description: 'API Key for authentication. Contact administrator to obtain your API key.',
      },
      'api-key',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  const swaggerCustomOptions = {
    customCssUrl:
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.10.5/swagger-ui.min.css',
    customJs: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.js',
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.js',
    ],
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'list',
      filter: true,
      showRequestHeaders: true,
    },
  };

  SwaggerModule.setup(`/api-docs`, app, document, swaggerCustomOptions);
}
