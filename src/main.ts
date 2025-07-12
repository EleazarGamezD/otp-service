import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import config from './core/IConfiguraion/IConfiguration.configuration';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configuration = config();

  await app.listen(configuration.port);
  console.log(`🚀 Application is running on port ${configuration.port}`);
}
bootstrap();
