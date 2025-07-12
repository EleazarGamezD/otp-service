import {RequestWithClient} from '@app/core/interfaces/auth/auth.interface';
import {IConfiguration} from '@app/core/interfaces/configuration/configuration.interface';
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

    try {
      const client = await this.apiKeyService.validateForOtpOperation(apiKey);

      // Transform client document to IClient interface
      request.client = {
        _id: (client as any)._id.toString(),
        companyName: client.companyName,
        apiKey: client.apiKey,
        isActive: client.isActive,
        tokens: client.tokens,
        tokensUsed: client.tokensUsed,
        rateLimitPerMinute: client.rateLimitPerMinute,
        emailTemplate: client.emailTemplate,
        whatsappTemplate: client.whatsappTemplate
      };

      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException || error.name === 'ForbiddenException') {
        throw error;
      }
      throw new UnauthorizedException('API Key validation failed');
    }
  }
}
