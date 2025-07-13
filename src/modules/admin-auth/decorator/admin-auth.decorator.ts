import {applyDecorators, UseGuards} from '@nestjs/common';
import {ApiBearerAuth, ApiUnauthorizedResponse} from '@nestjs/swagger';
import {AdminJwtGuard} from '../guards/admin-jwt.guard';

export function AdminAuth() {
  return applyDecorators(
    UseGuards(AdminJwtGuard),
    ApiBearerAuth('admin-auth'),
    ApiUnauthorizedResponse({
      description: 'Admin authentication required',
      schema: {
        type: 'object',
        properties: {
          statusCode: {type: 'number', example: 401},
          message: {type: 'string', example: 'Admin token is required'},
          error: {type: 'string', example: 'Unauthorized'},
        },
      },
    }),
  );
}
