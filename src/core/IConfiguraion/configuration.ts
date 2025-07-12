import {IConfiguration} from '@app/core/interfaces/configuration/configuration.interface';

export default (): IConfiguration => ({
    port: process.env.PORT ? parseInt(process.env.PORT, 10) : undefined,
    mongoUri: process.env.MONGO_URI,
    appName: process.env.APP_NAME,
    version: process.env.VERSION,
    logger: process.env.LOGGER,
    nodeEnv: process.env.NODE_ENV,
    vercelDeploy: process.env.VERCEL_DEPLOY === 'true',
    redisKeys: {
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : undefined,
    },
    otpKeys: {
        queueName: process.env.OTP_QUEUE_NAME,
        expiration: process.env.OTP_EXPIRATION ? parseInt(process.env.OTP_EXPIRATION, 10) : undefined,
    },
    rateLimitKeys: {
        windowMs: process.env.RATE_LIMIT_WINDOW_MS ? parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) : undefined,
        maxRequests: process.env.RATE_LIMIT_MAX_REQUESTS ? parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) : undefined,
    },
    mailKeys: {
        from: process.env.MAIL_FROM,
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT ? parseInt(process.env.MAIL_PORT, 10) : undefined,
        secure: process.env.MAIL_SECURE === 'true',
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
    },
    whatsappKeys: {
        apiUrl: process.env.WHATSAPP_API_URL,
        apiKey: process.env.WHATSAPP_API_KEY,
    },
    securityKeys: {
        apiKeyHeader: process.env.API_KEY_HEADER,
    },
});
