import {Injectable, NestMiddleware} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {NextFunction, Request, Response} from 'express';

@Injectable()
export class AdminAuthMiddleware implements NestMiddleware {
    constructor(private configService: ConfigService) { }

    use(req: Request, res: Response, next: NextFunction) {
        // Only apply to admin-docs routes
        if (!req.path.includes('admin-docs')) {
            return next();
        }

        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Basic ')) {
            res.status(401).json({
                statusCode: 401,
                message: 'Basic authentication required',
                error: 'Unauthorized'
            });
            return;
        }

        try {
            const token = authHeader.substring(6);
            const credentials = Buffer.from(token, 'base64').toString('utf-8');
            const [username, password] = credentials.split(':');

            const adminUsername = this.configService.get<string>('adminKeys.username');
            const adminPassword = this.configService.get<string>('adminKeys.password');

            if (!adminUsername || !adminPassword) {
                res.status(500).json({
                    statusCode: 500,
                    message: 'Admin credentials not configured',
                    error: 'Internal Server Error'
                });
                return;
            }

            if (username === adminUsername && password === adminPassword) {
                return next();
            }

            res.status(401).json({
                statusCode: 401,
                message: 'Invalid credentials',
                error: 'Unauthorized'
            });
        } catch (error) {
            res.status(401).json({
                statusCode: 401,
                message: 'Invalid authentication format',
                error: 'Unauthorized'
            });
        }
    }
}
