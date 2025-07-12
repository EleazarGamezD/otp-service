import {MiddlewareConsumer, Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import config from './core/IConfiguraion/IConfiguration.configuration';
import {RateLimitMiddleware} from './modules/auth/middleware/rate-limit.middleware';
import {ApiKeyService} from './modules/auth/service/api-key.service';
import {MailService} from './modules/mail/service/mail.service';
import {OtpController} from './modules/otp/controller/otp.controller';
import {OtpProcessor} from './modules/otp/processor/otp.processor';
import {OtpService} from './modules/otp/service/otp.service';
import {WhatsappService} from './modules/whatsapp/service/whatsapp.service';

const configuration = config();

@Module({
  imports: [

  ],
  controllers: [AppController, OtpController],
  providers: [AppService, OtpService, OtpProcessor, MailService, WhatsappService, ApiKeyService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RateLimitMiddleware).forRoutes('otp');
  }
}
