import {MiddlewareConsumer, Module} from '@nestjs/common';
import {ConfigModule, ConfigService} from '@nestjs/config';
import {LoggerModule} from 'nestjs-pino';
import configuration from './core/IConfiguraion/configuration';
import {AdminAuthMiddleware} from './modules/admin-auth/middleware/admin-auth.middleware';
import {RateLimitMiddleware} from './modules/auth/middleware/rate-limit.middleware';
import {SharedModule} from './modules/shared/shared.module';

@Module({
  imports: [
    SharedModule,
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
    consumer.apply(AdminAuthMiddleware).forRoutes('*');
  }
}
