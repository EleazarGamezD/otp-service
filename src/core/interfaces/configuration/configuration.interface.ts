export interface IRedisKeys {
    host: string;
    port: number;
}

export interface IOtpKeys {
    queueName: string;
    expiration: number;
}

export interface IRateLimitKeys {
    windowMs: number;
    maxRequests: number;
}

export interface IMailKeys {
    serviceUrl: string;
}

export interface IWhatsappKeys {
    apiUrl: string;
    apiKey: string;
}

export interface ISecurityKeys {
    apiKeyHeader: string;
}

export interface IConfiguration {
    port: number;
    mongoUri: string;
    appName: string;
    version: string;
    logger: string;
    nodeEnv: string;
    vercelDeploy: boolean;
    redisKeys: IRedisKeys;
    otpKeys: IOtpKeys;
    rateLimitKeys: IRateLimitKeys;
    mailKeys: IMailKeys;
    whatsappKeys: IWhatsappKeys;
    securityKeys: ISecurityKeys;
}
