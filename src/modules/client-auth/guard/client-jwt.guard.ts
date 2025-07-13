import {Injectable, UnauthorizedException} from '@nestjs/common';
import {AuthGuard} from '@nestjs/passport';

@Injectable()
export class ClientJwtGuard extends AuthGuard('client-jwt') {
    handleRequest(err: any, user: any, info: any) {
        if (err || !user) {
            throw err || new UnauthorizedException('Token de cliente inválido');
        }
        return user;
    }
}
