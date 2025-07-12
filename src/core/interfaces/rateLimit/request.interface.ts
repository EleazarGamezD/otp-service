import {Request} from 'express';

export interface IClient {
    _id: string;
    name: string;
    apiKey: string;
    rateLimitPerMinute: number;
}

export interface RequestWithClient extends Request {
    client?: IClient;
}