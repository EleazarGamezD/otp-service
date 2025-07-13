import {Module, forwardRef} from '@nestjs/common';
import {JwtModule} from '@nestjs/jwt';
import {PassportModule} from '@nestjs/passport';
import {SharedModule} from '../../shared/shared.module';
import {ClientAuthController} from '../controller/client-auth.controller';
import {ClientJwtGuard} from '../guard/client-jwt.guard';
import {ClientAuthService} from '../service/client-auth.service';
import {ClientJwtStrategy} from '../strategy/client-jwt.strategy';

@Module({
    imports: [
        forwardRef(() => SharedModule),
        PassportModule.register({defaultStrategy: 'client-jwt'}),
        JwtModule.register({
            secret: process.env.JWT_SECRET || 'fallback-secret',
            signOptions: {expiresIn: '30d'},
        }),
    ],
    controllers: [ClientAuthController],
    providers: [ClientAuthService, ClientJwtStrategy, ClientJwtGuard],
    exports: [ClientAuthService, ClientJwtGuard, ClientJwtStrategy],
})
export class ClientAuthModule { }
