import {CanActivate, ExecutionContext, Injectable, UnauthorizedException} from '@nestjs/common';
import {Reflector} from '@nestjs/core';
import {ApiKeyService} from '../api-key.service';

@Injectable()
export class ApiKeyGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private readonly apiKeyService: ApiKeyService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isProtected = this.reflector.get<boolean>('apiKeyProtected', context.getHandler());
        if (!isProtected) return true;

        const request = context.switchToHttp().getRequest();
        const apiKey = request.headers['x-api-key'];

        if (!apiKey) {
            throw new UnauthorizedException('API Key missing');
        }

        try {
            // Only validate API key exists and client is active
            const client = await this.apiKeyService.validateApiKey(apiKey);

            // Store only basic client info in request for backward compatibility
            request.client = {
                _id: (client as any)._id.toString(),
                companyName: client.companyName,
                email: client.email,
                apiKey: client.apiKey,
                isActive: client.isActive,
                role: client.role
            };

            return true;
        } catch (error) {
            if (error instanceof UnauthorizedException) {
                throw error;
            }
            throw new UnauthorizedException('Invalid API Key');
        }
    }
}
