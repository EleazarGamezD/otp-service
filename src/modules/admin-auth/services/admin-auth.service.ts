import {Injectable, UnauthorizedException} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {JwtService} from '@nestjs/jwt';
import {AdminLoginDto} from '../dto/admin-login.dto';
import {AdminAuthResult, AdminJwtPayload} from '../interfaces/admin-auth.interface';

@Injectable()
export class AdminAuthService {
    constructor(
        private configService: ConfigService,
        private jwtService: JwtService,
    ) { }

    async validateAdmin(username: string, password: string): Promise<boolean> {
        const adminUsername = this.configService.get<string>('adminKeys.username');
        const adminPassword = this.configService.get<string>('adminKeys.password');

        if (!adminUsername || !adminPassword) {
            throw new UnauthorizedException('Admin credentials not configured');
        }

        return username === adminUsername && password === adminPassword;
    }

    async login(adminLoginDto: AdminLoginDto): Promise<AdminAuthResult> {
        const {username, password} = adminLoginDto;

        const isValid = await this.validateAdmin(username, password);
        if (!isValid) {
            throw new UnauthorizedException('Invalid admin credentials');
        }

        const payload: AdminJwtPayload = {
            username,
            role: 'admin',
        };

        const access_token = this.jwtService.sign(payload);
        const expiresIn = this.configService.get<number>('adminKeys.jwtExpiresIn') || 3600;

        return {
            access_token,
            token_type: 'Bearer',
            expires_in: expiresIn,
            user: {
                username,
                role: 'admin',
            },
        };
    }

    async validateToken(token: string): Promise<AdminJwtPayload> {
        try {
            const payload = this.jwtService.verify(token);
            if (payload.role !== 'admin') {
                throw new UnauthorizedException('Insufficient privileges');
            }
            return payload;
        } catch (error) {
            throw new UnauthorizedException('Invalid or expired token');
        }
    }
}
