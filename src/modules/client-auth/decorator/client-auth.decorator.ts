import {applyDecorators, UseGuards} from '@nestjs/common';
import {ApiBearerAuth, ApiUnauthorizedResponse} from '@nestjs/swagger';
import {ClientJwtGuard} from '../guard/client-jwt.guard';

export function ClientAuth() {
    return applyDecorators(
        UseGuards(ClientJwtGuard),
        ApiBearerAuth('client-jwt'),
        ApiUnauthorizedResponse({
            description: 'Token de cliente inválido o expirado',
            schema: {
                type: 'object',
                properties: {
                    statusCode: {type: 'number', example: 401},
                    message: {type: 'string', example: 'Token de cliente inválido'},
                    error: {type: 'string', example: 'Unauthorized'}
                }
            }
        })
    );
}
