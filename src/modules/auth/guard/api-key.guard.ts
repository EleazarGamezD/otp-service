import {CanActivate, ExecutionContext, Injectable, UnauthorizedException} from '@nestjs/common';
import {Reflector} from '@nestjs/core';
import config from '../../../core/IConfiguraion/configuration';
import {ApiKeyService} from '../service/api-key.service';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  private readonly configuration = config();

  constructor(
    private reflector: Reflector,
    private readonly apiKeyService: ApiKeyService,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isProtected = this.reflector.get<boolean>('apiKeyProtected', context.getHandler());
    if (!isProtected) return true;

    const request = context.switchToHttp().getRequest();
    const apiKeyHeader = this.configuration.securityKeys.apiKeyHeader;
    const apiKey = request.headers[apiKeyHeader];

    if (!apiKey) throw new UnauthorizedException('API Key missing');

    const client = await this.apiKeyService.validateApiKey(apiKey);
    if (!client) throw new UnauthorizedException('API Key inválida');

    request.client = client;
    return true;
  }
}
