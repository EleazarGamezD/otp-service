export interface IClientRegisterRequest {
    companyName: string;
    email: string;
    password: string;
}

export interface IClientLoginRequest {
    email: string;
    password: string;
}

export interface IClientAuthResponse {
    accessToken: string;
    client: {
        id: string;
        companyName: string;
        email: string;
        role: string;
        apiKey: string;
        isActive: boolean;
        hasUnlimitedTokens: boolean;
        isProduction: boolean;
        tokens: number;
        tokensUsed: number;
    };
}

export interface IClientChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
}

export interface IClientProfileResponse {
    id: string;
    companyName: string;
    email: string;
    role: string;
    apiKey: string;
    isActive: boolean;
    hasUnlimitedTokens: boolean;
    isProduction: boolean;
    tokens: number;
    tokensUsed: number;
    rateLimitPerMinute: number;
    otpExpirationSeconds: number;
    createdAt: Date;
    updatedAt: Date;
}
