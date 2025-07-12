import {HttpException, HttpStatus, Injectable, NestMiddleware} from '@nestjs/common';
import {NextFunction, Request, Response} from 'express';
import config from '../../../core/IConfiguraion/configuration';

interface RequestWithClient extends Request {
  client?: any;
}

const requestCounts = new Map<string, {count: number; timestamp: number}>();

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  private readonly configuration = config();

  use(req: RequestWithClient, res: Response, next: NextFunction) {
    const client = req.client;
    if (!client) return next();

    const now = Date.now();
    const key = client.apiKey;
    const limit = client.rateLimitPerMinute || this.configuration.rateLimitKeys.maxRequests;
    const windowMs = this.configuration.rateLimitKeys.windowMs;

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
