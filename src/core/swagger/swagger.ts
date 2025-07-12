import {INestApplication} from '@nestjs/common';
import {DocumentBuilder, SwaggerModule} from '@nestjs/swagger';

export function setupSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('Buscandi API')
    .setDescription(
      'Buscandi es una aplicación innovadora que actúa como un directorio integral de restaurantes y platillos.\n\n' +
        'Los restaurantes pueden tener su propia página individual y una página de conglomerado para franquicias.\n\n' +
        'Los usuarios pueden localizar restaurantes cercanos a su zona y utilizar el buscador para aplicar filtros por restaurante o por tipo de comida.\n\n' +
        'Además, los usuarios pueden calificar tanto los platos como los restaurantes.\n\n' +
        'Cada restaurante tendrá una página con su cartera de menú, permitiendo la generación de un código QR.',
    )
    .setVersion('1.0')
    .addTag('Buscandi')
    .addServer(`https://buscandi-backend.vercel.app/`, 'Production Server')
    .addServer(`http://localhost:${process.env.PORT}`, 'Local Server')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'token',
    )
    .addOAuth2({
      name: 'google',
      type: 'oauth2',
      description: 'OAuth2 with Google',
      flows: {
        implicit: {
          authorizationUrl: `https://accounts.google.com/o/oauth2/v2/auth`,
          tokenUrl: `https://oauth2.googleapis.com/token`,
          scopes: {
            'https://www.googleapis.com/auth/userinfo.profile':
              'View your profile information',
            'https://www.googleapis.com/auth/userinfo.email':
              'View your email address',
          },
        },
      },
    })
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
      oauth2RedirectUrl: `https://buscandi-backend.vercel.app/oauth2-redirect.html`,
      oauth: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        appName: 'Buscandi',
        scopes: ['openid, profile'],
      },
    },
  };

  SwaggerModule.setup(`/`, app, document, swaggerCustomOptions);
}
