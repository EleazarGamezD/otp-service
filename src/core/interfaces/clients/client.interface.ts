export interface IClient {
    id?: string;
    companyName: string;
    email?: string;
    password?: string;
    role?: string;
    apiKey: string;
    isActive: boolean;
    hasUnlimitedTokens?: boolean;
    isProduction?: boolean;
    tokens: number;
    tokensUsed: number;
    rateLimitPerMinute: number;
    otpExpirationSeconds: number;
    emailTemplate: IEmailTemplate;
    whatsappTemplate: IWhatsAppTemplate;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IEmailTemplate {
    subject: string;
    body: string; // HTML template with {{code}} placeholder
}

export interface IWhatsAppTemplate {
    message: string; // Text template with {{code}} placeholder
}

export interface IClientCreateRequest {
    companyName: string;
    tokens?: number;
    rateLimitPerMinute?: number;
    otpExpirationSeconds?: number;
    emailTemplate?: Partial<IEmailTemplate>;
    whatsappTemplate?: Partial<IWhatsAppTemplate>;
}

export interface IClientUpdateRequest {
    companyName?: string;
    email?: string;
    isActive?: boolean;
    tokens?: number;
    hasUnlimitedTokens?: boolean;
    isProduction?: boolean;
    rateLimitPerMinute?: number;
    otpExpirationSeconds?: number;
    emailTemplate?: Partial<IEmailTemplate>;
    whatsappTemplate?: Partial<IWhatsAppTemplate>;
}

export interface IClientResponse {
    id: string;
    companyName: string;
    email?: string;
    role?: string;
    apiKey: string;
    isActive: boolean;
    hasUnlimitedTokens?: boolean;
    isProduction?: boolean;
    tokens: number;
    tokensUsed: number;
    remainingTokens: number;
    rateLimitPerMinute: number;
    otpExpirationSeconds: number;
    otpExpirationMinutes: number; // Helper field for display
    createdAt: Date;
    updatedAt: Date;
}

export interface ITokenConsumptionResponse {
    tokensRemaining: number;
    tokensUsed: number;
    canProceed: boolean;
    reason?: string;
}
