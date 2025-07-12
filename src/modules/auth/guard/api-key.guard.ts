import {IConfiguration} from '@app/core/IConfiguraion/configuration';
import {RequestWithClient} from '@app/core/interfaces/rateLimit/request.interface';
import {CanActivate, ExecutionContext, Injectable, UnauthorizedException} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {Reflector} from '@nestjs/core';
import {ApiKeyService} from '../service/api-key.service';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly apiKeyService: ApiKeyService,
    private configService: ConfigService,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isProtected = this.reflector.get<boolean>('apiKeyProtected', context.getHandler());
    if (!isProtected) return true;

    const request = context.switchToHttp().getRequest<RequestWithClient>();
    const securityConfig = this.configService.get<IConfiguration['securityKeys']>('securityKeys');
    const apiKeyHeader = securityConfig?.apiKeyHeader || 'x-api-key';
    const apiKey = Array.isArray(request.headers[apiKeyHeader])
      ? request.headers[apiKeyHeader][0]
      : request.headers[apiKeyHeader];

    if (!apiKey) throw new UnauthorizedException('API Key missing');

    const client = await this.apiKeyService.validateApiKey(apiKey);
    if (!client) throw new UnauthorizedException('API Key inválida');

    // Transform client document to IClient interface
    request.client = {
      _id: (client._id as unknown as string).toString(),
      name: client.name,
      apiKey: client.apiKey,
      rateLimitPerMinute: client.rateLimitPerMinute,
    };
    return true;
  }
}
