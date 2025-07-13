import {CanActivate, ExecutionContext, Injectable, UnauthorizedException} from '@nestjs/common';
import {Reflector} from '@nestjs/core';
import {Request} from 'express';
import {AdminJwtPayload} from '../interfaces/admin-auth.interface';
import {AdminAuthService} from '../services/admin-auth.service';

@Injectable()
export class AdminJwtGuard implements CanActivate {
    constructor(
        private adminAuthService: AdminAuthService,
        private reflector: Reflector,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();

        const token = this.extractTokenFromHeader(request);
        if (!token) {
            throw new UnauthorizedException('Admin token is required');
        }

        try {
            const payload: AdminJwtPayload = await this.adminAuthService.validateToken(token);
            // Añadir el payload al request para uso posterior
            (request as any).admin = payload;
            return true;
        } catch (error) {
            throw new UnauthorizedException('Invalid admin token');
        }
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}
