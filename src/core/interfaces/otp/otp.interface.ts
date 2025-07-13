import {OtpChannel} from '@app/core/enums/otp/channel.enum';

// Nuevas interfaces para el sistema multi-proyecto
export interface IOtpEmailRequest {
    type: 'email';
    email: string;
    projectId: string;
}

export interface IOtpWhatsappRequest {
    type: 'whatsapp';
    countryCode: string; // Ej: "+57", "+1", "+34"
    phone: string; // Número sin código de país
    projectId: string;
}

export type IOtpRequest = IOtpEmailRequest | IOtpWhatsappRequest;

export interface IOtpVerifyRequest {
    otpCode: string;
    type: 'email' | 'whatsapp';
    projectId: string;
}

export interface IOtpResponse {
    success: boolean;
    message: string;
    recordId: string; // ID único para rastreo
    expiresAt: Date;
    target: string; // Email o teléfono (puede estar parcialmente oculto)
    tokensRemaining?: number; // Solo si no tiene tokens ilimitados
}

export interface IOtpVerifyResponse {
    success: boolean;
    message: string;
    verified: boolean;
    recordId?: string;
    tokensRemaining?: number;
}

// Interfaces legacy (mantener por compatibilidad)
export interface IOtpGenerateRequest {
    target: string;
    channel: OtpChannel;
}

export interface IOtpGenerateResponse {
    message: string;
    expiresIn: number;
    tokensRemaining?: number;
}

export interface IOtpVerifyRequestLegacy {
    target: string;
    code: string;
}

export interface IOtpVerifyResponseLegacy {
    valid: boolean;
    reason?: string;
}
