import {OtpChannel} from '@app/core/enums/otp/channel.enum';

export interface IOtpGenerateRequest {
    target: string;
    channel: OtpChannel;
}

export interface IOtpGenerateResponse {
    message: string;
    expiresIn: number;
    tokensRemaining?: number;
}

export interface IOtpVerifyRequest {
    target: string;
    code: string;
}

export interface IOtpVerifyResponse {
    valid: boolean;
    reason?: string;
}
