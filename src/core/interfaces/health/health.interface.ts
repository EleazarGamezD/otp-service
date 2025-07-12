export interface IHealthStatus {
    status: string;
    serverVersion: string;
    info: string;
}

export interface IHealthCheckResult {
    db: any;
    server: IHealthStatus;
}
