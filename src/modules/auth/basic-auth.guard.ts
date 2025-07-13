import {CanActivate, ExecutionContext, Injectable, UnauthorizedException} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {Request} from 'express';

@Injectable()
export class BasicAuthGuard implements CanActivate {
    constructor(private configService: ConfigService) { }

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest<Request>();

        // Skip authentication for swagger documentation paths
        if (request.path.includes('admin-docs')) {
            return this.validateBasicAuth(request);
        }

        return true;
    }

    private validateBasicAuth(request: Request): boolean {
        const authHeader = request.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Basic ')) {
            throw new UnauthorizedException('Basic authentication required');
        }

        try {
            const token = authHeader.substring(6);
            const credentials = Buffer.from(token, 'base64').toString('utf-8');
            const [username, password] = credentials.split(':');

            const adminUsername = this.configService.get<string>('adminKeys.username');
            const adminPassword = this.configService.get<string>('adminKeys.password');

            if (!adminUsername || !adminPassword) {
                throw new UnauthorizedException('Admin credentials not configured');
            }

            if (username === adminUsername && password === adminPassword) {
                return true;
            }

            throw new UnauthorizedException('Invalid credentials');
        } catch (error) {
            throw new UnauthorizedException('Invalid authentication format');
        }
    }
}
