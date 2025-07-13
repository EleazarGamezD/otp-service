import {Injectable, UnauthorizedException} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {PassportStrategy} from '@nestjs/passport';
import {ExtractJwt, Strategy} from 'passport-jwt';
import {ClientAuthService} from '../service/client-auth.service';

@Injectable()
export class ClientJwtStrategy extends PassportStrategy(Strategy, 'client-jwt') {
    constructor(
        private configService: ConfigService,
        private clientAuthService: ClientAuthService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET') || 'fallback-secret',
        });
    }

    async validate(payload: any) {
        if (payload.type !== 'client') {
            throw new UnauthorizedException('Token tipo inválido');
        }

        const client = await this.clientAuthService.validateToken(payload);
        return client;
    }
}
