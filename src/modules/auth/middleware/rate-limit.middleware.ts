import {RequestWithClient} from '@app/core/interfaces/auth/auth.interface';
import {IConfiguration} from '@app/core/interfaces/configuration/configuration.interface';
import {HttpException, HttpStatus, Injectable, NestMiddleware} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {NextFunction, Response} from 'express';

const requestCounts = new Map<string, {count: number; timestamp: number}>();

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  constructor(private configService: ConfigService) { }

  use(req: RequestWithClient, res: Response, next: NextFunction) {
    const client = req.client;
    if (!client) return next();

    const now = Date.now();
    const key = client.apiKey;
    const rateLimitConfig = this.configService.get<IConfiguration['rateLimitKeys']>('rateLimitKeys');
    const limit = client.rateLimitPerMinute || rateLimitConfig?.maxRequests || 5;
    const windowMs = rateLimitConfig?.windowMs || 60000;

    const entry = requestCounts.get(key);
    if (!entry || now - entry.timestamp > windowMs) {
      requestCounts.set(key, {count: 1, timestamp: now});
    } else {
      if (entry.count >= limit) {
        throw new HttpException('Rate limit exceeded', HttpStatus.TOO_MANY_REQUESTS);
      }
      entry.count++;
    }
    next();
  }
}
