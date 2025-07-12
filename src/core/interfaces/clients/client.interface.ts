export interface IClient {
    id?: string;
    companyName: string;
    apiKey: string;
    isActive: boolean;
    tokens: number;
    tokensUsed: number;
    rateLimitPerMinute: number;
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
    emailTemplate?: Partial<IEmailTemplate>;
    whatsappTemplate?: Partial<IWhatsAppTemplate>;
}

export interface IClientUpdateRequest {
    companyName?: string;
    isActive?: boolean;
    tokens?: number;
    rateLimitPerMinute?: number;
    emailTemplate?: Partial<IEmailTemplate>;
    whatsappTemplate?: Partial<IWhatsAppTemplate>;
}

export interface IClientResponse {
    id: string;
    companyName: string;
    apiKey: string;
    isActive: boolean;
    tokens: number;
    tokensUsed: number;
    remainingTokens: number;
    rateLimitPerMinute: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface ITokenConsumptionResponse {
    tokensRemaining: number;
    tokensUsed: number;
    canProceed: boolean;
    reason?: string;
}
