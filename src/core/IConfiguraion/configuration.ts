import {IConfiguration} from '@app/core/interfaces/configuration/configuration.interface';

export default (): IConfiguration => ({
    port: parseInt(process.env.PORT || '3000', 10),
    mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/otp-service',
    appName: process.env.APP_NAME || 'OTP Service',
    version: process.env.VERSION || '1.0.0',
    logger: process.env.LOGGER || 'console',
    nodeEnv: process.env.NODE_ENV || 'development',
    vercelDeploy: process.env.VERCEL_DEPLOY === 'true' || false,
    redisKeys: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
    },
    otpKeys: {
        queueName: process.env.OTP_QUEUE_NAME || 'otp-queue',
        expiration: parseInt(process.env.OTP_EXPIRATION || '45', 10),
    },
    rateLimitKeys: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
        maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '5', 10),
    },
    mailKeys: {
        serviceUrl: process.env.MAIL_SERVICE_URL || 'http://localhost:3001',
    },
    whatsappKeys: {
        apiUrl: process.env.WHATSAPP_API_URL || 'http://localhost:3002',
        apiKey: process.env.WHATSAPP_API_KEY || 'your-whatsapp-api-key',
    },
    securityKeys: {
        apiKeyHeader: process.env.API_KEY_HEADER || 'x-api-key',
    },
});
