import {IClientCreateRequest, IClientResponse, IClientUpdateRequest, ITokenConsumptionResponse} from '@app/core/interfaces/clients/client.interface';
import {ConflictException, ForbiddenException, Injectable, NotFoundException} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {randomBytes} from 'crypto';
import {Model} from 'mongoose';
import {Client} from '../../../core/database/schemas/clients/client.schema';

@Injectable()
export class ClientService {
    constructor(
        @InjectModel(Client.name) private clientModel: Model<Client>,
    ) { }

    /**
     * Generate a production API key with prod_ prefix
     */
    private generateApiKey(): string {
        const randomKey = randomBytes(32).toString('hex');
        return `prod_${randomKey}`;
    }

    /**
     * Create a new client
     */
    async createClient(createRequest: IClientCreateRequest): Promise<IClientResponse> {
        // Check if company name already exists
        const existingClient = await this.clientModel.findOne({
            companyName: createRequest.companyName
        });

        if (existingClient) {
            throw new ConflictException('Company name already exists');
        }

        const apiKey = this.generateApiKey();

        const clientData = {
            companyName: createRequest.companyName,
            apiKey,
            tokens: createRequest.tokens || 100, // Default 100 tokens
            rateLimitPerMinute: createRequest.rateLimitPerMinute || 5,
            emailTemplate: {
                subject: createRequest.emailTemplate?.subject || 'Tu código de verificación',
                body: createRequest.emailTemplate?.body || '<h2>Código de verificación</h2><p>Tu código es: <strong>{{code}}</strong></p><p>Este código expira en 15 minutos.</p>'
            },
            whatsappTemplate: {
                message: createRequest.whatsappTemplate?.message || 'Tu código de verificación es: {{code}}. Este código expira en 15 minutos.'
            }
        };

        const client = await this.clientModel.create(clientData);
        return this.mapToClientResponse(client);
    }

    /**
     * Find client by API key
     */
    async findByApiKey(apiKey: string): Promise<Client | null> {
        return this.clientModel.findOne({apiKey, isActive: true});
    }

    /**
     * Get all clients
     */
    async findAll(): Promise<IClientResponse[]> {
        const clients = await this.clientModel.find().sort({createdAt: -1});
        return clients.map(client => this.mapToClientResponse(client));
    }

    /**
     * Get client by ID
     */
    async findById(id: string): Promise<IClientResponse> {
        const client = await this.clientModel.findById(id);
        if (!client) {
            throw new NotFoundException('Client not found');
        }
        return this.mapToClientResponse(client);
    }

    /**
     * Update client
     */
    async updateClient(id: string, updateRequest: IClientUpdateRequest): Promise<IClientResponse> {
        const client = await this.clientModel.findById(id);
        if (!client) {
            throw new NotFoundException('Client not found');
        }

        // Check for company name conflicts
        if (updateRequest.companyName && updateRequest.companyName !== client.companyName) {
            const existingClient = await this.clientModel.findOne({
                companyName: updateRequest.companyName,
                _id: {$ne: id}
            });

            if (existingClient) {
                throw new ConflictException('Company name already exists');
            }
        }

        const updateData: any = {...updateRequest};

        // Merge email template if provided
        if (updateRequest.emailTemplate) {
            updateData.emailTemplate = {
                ...client.emailTemplate,
                ...updateRequest.emailTemplate
            };
        }

        // Merge whatsapp template if provided
        if (updateRequest.whatsappTemplate) {
            updateData.whatsappTemplate = {
                ...client.whatsappTemplate,
                ...updateRequest.whatsappTemplate
            };
        }

        const updatedClient = await this.clientModel.findByIdAndUpdate(
            id,
            {...updateData, updatedAt: new Date()},
            {new: true}
        );

        return this.mapToClientResponse(updatedClient!);
    }

    /**
     * Deactivate client
     */
    async deactivateClient(id: string): Promise<IClientResponse> {
        const client = await this.clientModel.findByIdAndUpdate(
            id,
            {isActive: false, updatedAt: new Date()},
            {new: true}
        );

        if (!client) {
            throw new NotFoundException('Client not found');
        }

        return this.mapToClientResponse(client);
    }

    /**
     * Activate client
     */
    async activateClient(id: string): Promise<IClientResponse> {
        const client = await this.clientModel.findByIdAndUpdate(
            id,
            {isActive: true, updatedAt: new Date()},
            {new: true}
        );

        if (!client) {
            throw new NotFoundException('Client not found');
        }

        return this.mapToClientResponse(client);
    }

    /**
     * Add tokens to client
     */
    async addTokens(id: string, tokensToAdd: number): Promise<IClientResponse> {
        const client = await this.clientModel.findByIdAndUpdate(
            id,
            {
                $inc: {tokens: tokensToAdd},
                updatedAt: new Date()
            },
            {new: true}
        );

        if (!client) {
            throw new NotFoundException('Client not found');
        }

        return this.mapToClientResponse(client);
    }

    /**
     * Consume a token for OTP generation
     */
    async consumeToken(apiKey: string): Promise<ITokenConsumptionResponse> {
        const client = await this.findByApiKey(apiKey);

        if (!client) {
            throw new NotFoundException('Invalid API key');
        }

        if (!client.isActive) {
            throw new ForbiddenException('Client account is inactive');
        }

        const remainingTokens = client.tokens - client.tokensUsed;

        if (remainingTokens <= 0) {
            return {
                tokensRemaining: 0,
                tokensUsed: client.tokensUsed,
                canProceed: false,
                reason: 'No tokens remaining'
            };
        }

        // Increment used tokens
        const updatedClient = await this.clientModel.findByIdAndUpdate(
            client._id,
            {
                $inc: {tokensUsed: 1},
                updatedAt: new Date()
            },
            {new: true}
        );

        return {
            tokensRemaining: updatedClient!.tokens - updatedClient!.tokensUsed,
            tokensUsed: updatedClient!.tokensUsed,
            canProceed: true
        };
    }

    /**
     * Regenerate API key for client
     */
    async regenerateApiKey(id: string): Promise<IClientResponse> {
        const newApiKey = this.generateApiKey();

        const client = await this.clientModel.findByIdAndUpdate(
            id,
            {
                apiKey: newApiKey,
                updatedAt: new Date()
            },
            {new: true}
        );

        if (!client) {
            throw new NotFoundException('Client not found');
        }

        return this.mapToClientResponse(client);
    }

    /**
     * Map client document to response interface
     */
    private mapToClientResponse(client: Client): IClientResponse {
        return {
            id: (client as any)._id.toString(),
            companyName: client.companyName,
            apiKey: client.apiKey,
            isActive: client.isActive,
            tokens: client.tokens,
            tokensUsed: client.tokensUsed,
            remainingTokens: client.tokens - client.tokensUsed,
            rateLimitPerMinute: client.rateLimitPerMinute,
            createdAt: client.createdAt,
            updatedAt: client.updatedAt
        };
    }
}
