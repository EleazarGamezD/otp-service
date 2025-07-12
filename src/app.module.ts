import {MiddlewareConsumer, Module} from '@nestjs/common';
import {ConfigModule, ConfigService} from '@nestjs/config';
import {LoggerModule} from 'nestjs-pino';
import configuration from './core/IConfiguraion/configuration';
import {RateLimitMiddleware} from './modules/auth/middleware/rate-limit.middleware';
import {ClientModule} from './modules/clients/module/client.module';
import {OtpModule} from './modules/otp/module/otp.module';
import {SharedModule} from './modules/shared/shared.module';

@Module({
  imports: [
    SharedModule,
    ClientModule,
    OtpModule,
    ConfigModule.forRoot({
      envFilePath: '.env',
      load: [configuration],
      isGlobal: true,
    }),
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        pinoHttp:
          configService.get<string>('VERCEL_DEPLOY') !== 'true'
            ? {
              transport: {
                target: 'pino-pretty',
                options: {
                  colorize: true,
                  translateTime: 'SYS:standard',
                  singleLine: true,
                },
              },
            }
            : undefined,
      }),
    }),
  ]
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RateLimitMiddleware).forRoutes('otp');
  }
}
