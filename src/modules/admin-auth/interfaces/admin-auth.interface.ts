export interface AdminJwtPayload {
    username: string;
    role: string;
    iat?: number;
    exp?: number;
}

export interface AdminAuthResult {
    access_token: string;
    token_type: string;
    expires_in: number;
    user: {
        username: string;
        role: string;
    };
}
