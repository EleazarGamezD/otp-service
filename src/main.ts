import {AppModule} from '@app/app.module';
import {NodeEnvironment} from '@app/core/enums/environment/node-env.enum';
import {Logger, ValidationPipe} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {NestFactory} from '@nestjs/core';
import {setupSwagger} from '@swagger/swagger';
import {corsConfig} from './core/cors/cors.config';
import {AllExceptionsFilter} from './core/exceptions-filters/exception-filter';
import {EnvValidation} from './core/validator/env.validation';

async function bootstrap() {
  EnvValidation.validate();
  const app = await NestFactory.create(AppModule, {
    cors: true,
  });

  const logger = new Logger('OTP-Service');
  const configService = app.get(ConfigService);

  // Use global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    disableErrorMessages: false,
    whitelist: true,
    forbidNonWhitelisted: true,
  }));

  // Enable CORS
  const nodeEnv = configService.get<string>('nodeEnv');
  if (nodeEnv === NodeEnvironment.DEVELOPMENT) {
    app.enableCors();
  } else {
    app.enableCors(corsConfig);
  }

  // Set global prefix
  const version = configService.get<string>('version');
  app.setGlobalPrefix(`api/${version}`);

  // Use global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Configure Swagger
  setupSwagger(app);

  const port = configService.get<number>('port') || 3000;
  await app.listen(port);
  logger.log(`🚀 OTP Service running on port ${port}`);
  logger.log(`📚 Public API Documentation: http://localhost:${port}/api-docs`);
  logger.log(`🛠️ Admin Panel Documentation: http://localhost:${port}/admin-docs`);
}
bootstrap();
