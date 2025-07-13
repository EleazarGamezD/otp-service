export interface IClient {
    id?: string;
    companyName: string;
    email: string;
    password?: string;
    role: string;
    apiKey: string;
    isActive: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IClientCreateRequest {
    companyName: string;
    email: string;
    password: string;
}

export interface IClientUpdateRequest {
    companyName?: string;
    email?: string;
    isActive?: boolean;
}

export interface IClientResponse {
    id: string;
    companyName: string;
    email: string;
    role: string;
    apiKey: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    // Información agregada de proyectos
    totalProjects?: number;
    activeProjects?: number;
    totalTokensAcrossProjects?: number;
}
