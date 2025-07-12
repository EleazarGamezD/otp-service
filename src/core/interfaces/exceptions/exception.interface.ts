export interface CustomExceptionInterface {
    status: number;
    message: string;
}

export interface ErrorResponseData {
    message: string;
}

export interface HttpExceptionResponse {
    status: number;
    message: string;
    error?: string;
}
