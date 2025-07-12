import {AppModule} from '@app/app.module';
import {ConfigurationService} from '@config/configuration.service';
import {Logger, ValidationPipe} from '@nestjs/common';
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
  const configService = app.get(ConfigurationService);

  // Use global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    disableErrorMessages: false,
    whitelist: true,
    forbidNonWhitelisted: true,
  }));

  // Enable CORS
  if (process.env.NODE_ENV === 'development') {
    app.enableCors();
  } else {
    app.enableCors(corsConfig);
  }

  // Set global prefix
  app.setGlobalPrefix(`api/${process.env.VERSION}`);

  // Use global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // Configure Swagger
  setupSwagger(app);

  await app.listen(configService.config.port);
  logger.log(`🚀 OTP Service running on port ${configService.config.port}`);
  logger.log(`📚 API Documentation available at http://localhost:${configService.config.port}/api-docs`);
}
bootstrap();
