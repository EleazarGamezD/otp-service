export interface IRedisKeys {
    host: string | undefined;
    port: number | undefined;
}

export interface IOtpKeys {
    queueName: string | undefined;
    expiration: number | undefined;
}

export interface IRateLimitKeys {
    windowMs: number | undefined;
    maxRequests: number | undefined;
}

export interface IMailKeys {
    from: string | undefined;
    resendApiKey: string | undefined;
    // Legacy SES config
    host: string | undefined;
    port: number | undefined;
    secure: boolean | undefined;
    user: string | undefined;
    pass: string | undefined;
}

export interface IWhatsappKeys {
    apiUrl: string | undefined;
    apiKey: string | undefined;
}

export interface ISecurityKeys {
    apiKeyHeader: string | undefined;
}

export interface IAdminKeys {
    username: string | undefined;
    password: string | undefined;
    jwtSecret: string | undefined;
    jwtExpiresIn: string | undefined;
}

export interface IConfiguration {
    port: number | undefined;
    mongoUri: string | undefined;
    appName: string | undefined;
    version: string | undefined;
    logger: string | undefined;
    nodeEnv: string | undefined;
    vercelDeploy: boolean | undefined;
    redisKeys: IRedisKeys;
    otpKeys: IOtpKeys;
    rateLimitKeys: IRateLimitKeys;
    mailKeys: IMailKeys;
    whatsappKeys: IWhatsappKeys;
    securityKeys: ISecurityKeys;
    adminKeys: IAdminKeys;
}
