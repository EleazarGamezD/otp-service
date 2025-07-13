import {Global, Module} from '@nestjs/common';
import {ConfigModule, ConfigService} from '@nestjs/config';
import {JwtModule} from '@nestjs/jwt';
import {AdminAuthController} from '../controllers/admin-auth.controller';
import {AdminJwtGuard} from '../guards/admin-jwt.guard';
import {AdminAuthService} from '../services/admin-auth.service';

@Global()
@Module({
    imports: [
        ConfigModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>('adminKeys.jwtSecret'),
                signOptions: {
                    expiresIn: configService.get<string>('adminKeys.jwtExpiresIn') || '1h',
                },
            }),
            inject: [ConfigService],
        }),
    ],
    controllers: [AdminAuthController],
    providers: [AdminAuthService, AdminJwtGuard],
    exports: [AdminAuthService, AdminJwtGuard],
})
export class AdminAuthModule { }
