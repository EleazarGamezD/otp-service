import {Types} from 'mongoose';

export interface IEmailTemplate {
    subject: string;
    body: string; // HTML template with {{code}} placeholder
}

export interface IWhatsAppTemplate {
    message: string; // Text template with {{code}} placeholder
}

export interface IProject {
    id?: string;
    projectId: string; // ID público del proyecto
    clientId: Types.ObjectId;
    name: string;
    description?: string;
    isActive: boolean;
    hasUnlimitedTokens: boolean;
    isProduction: boolean;
    tokens: number;
    tokensUsed: number;
    rateLimitPerMinute: number;
    otpExpirationSeconds: number;
    emailTemplate: IEmailTemplate;
    whatsappTemplate: IWhatsAppTemplate;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IProjectCreateRequest {
    name: string;
    description?: string;
    tokens?: number;
    rateLimitPerMinute?: number;
    otpExpirationSeconds?: number;
    emailTemplate?: Partial<IEmailTemplate>;
    whatsappTemplate?: Partial<IWhatsAppTemplate>;
}

export interface IProjectUpdateRequest {
    name?: string;
    description?: string;
    isActive?: boolean;
    tokens?: number;
    hasUnlimitedTokens?: boolean;
    isProduction?: boolean;
    rateLimitPerMinute?: number;
    otpExpirationSeconds?: number;
    emailTemplate?: Partial<IEmailTemplate>;
    whatsappTemplate?: Partial<IWhatsAppTemplate>;
}

export interface IProjectResponse {
    id: string;
    projectId: string;
    clientId: string;
    name: string;
    description?: string;
    isActive: boolean;
    hasUnlimitedTokens: boolean;
    isProduction: boolean;
    tokens: number;
    tokensUsed: number;
    remainingTokens: number;
    rateLimitPerMinute: number;
    otpExpirationSeconds: number;
    otpExpirationMinutes: number; // Helper field for display
    emailTemplate: IEmailTemplate;
    whatsappTemplate: IWhatsAppTemplate;
    createdAt: Date;
    updatedAt: Date;
}

export interface ITokenConsumptionResponse {
    tokensRemaining: number;
    tokensUsed: number;
    canProceed: boolean;
    reason?: string;
}
