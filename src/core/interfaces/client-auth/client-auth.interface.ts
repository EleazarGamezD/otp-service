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
    createdAt: Date;
    updatedAt: Date;
    // Estadísticas agregadas de proyectos
    totalProjects?: number;
    activeProjects?: number;
    totalTokensAcrossProjects?: number;
    totalTokensUsedAcrossProjects?: number;
}
