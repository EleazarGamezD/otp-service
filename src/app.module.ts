import {MiddlewareConsumer, Module} from '@nestjs/common';
import {RateLimitMiddleware} from './modules/auth/middleware/rate-limit.middleware';

@Module({
  imports: [

  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RateLimitMiddleware).forRoutes('otp');
  }
}
