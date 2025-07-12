import {Request} from 'express';
import {IEmailTemplate, IWhatsAppTemplate} from '../clients/client.interface';

export interface IClient {
    _id: string;
    companyName: string;
    apiKey: string;
    isActive: boolean;
    tokens: number;
    tokensUsed: number;
    rateLimitPerMinute: number;
    emailTemplate: IEmailTemplate;
    whatsappTemplate: IWhatsAppTemplate;
}

export interface RequestWithClient extends Request {
    client?: IClient;
}
