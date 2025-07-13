import {IClientCreateRequest, IClientResponse, IClientUpdateRequest} from '@app/core/interfaces/clients/client.interface';
import {ConflictException, Injectable, NotFoundException} from '@nestjs/common';
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
     * Create a new client (solo para admins)
     */
    async createClient(createRequest: IClientCreateRequest): Promise<IClientResponse> {
        // Check if company name already exists
        const existingClient = await this.clientModel.findOne({
            companyName: createRequest.companyName
        });

        if (existingClient) {
            throw new ConflictException('Company name already exists');
        }

        // Check if email already exists
        const existingEmail = await this.clientModel.findOne({
            email: createRequest.email
        });

        if (existingEmail) {
            throw new ConflictException('Email already exists');
        }

        const apiKey = this.generateApiKey();

        const clientData = {
            companyName: createRequest.companyName,
            email: createRequest.email,
            password: createRequest.password, // En producción debería estar hasheado
            apiKey,
            isActive: true
        };

        const newClient = new this.clientModel(clientData);
        const savedClient = await newClient.save();

        return this.mapToResponse(savedClient);
    }

    /**
     * Get all clients
     */
    async findAll(): Promise<IClientResponse[]> {
        const clients = await this.clientModel.find().sort({createdAt: -1});
        return clients.map(client => this.mapToResponse(client));
    }

    /**
     * Find client by ID
     */
    async findById(id: string): Promise<IClientResponse> {
        const client = await this.clientModel.findById(id);

        if (!client) {
            throw new NotFoundException('Client not found');
        }

        return this.mapToResponse(client);
    }

    /**
     * Find client by API key
     */
    async findByApiKey(apiKey: string): Promise<Client | null> {
        return this.clientModel.findOne({apiKey, isActive: true});
    }

    /**
     * Update client
     */
    async updateClient(id: string, updateRequest: IClientUpdateRequest): Promise<IClientResponse> {
        const client = await this.clientModel.findById(id);

        if (!client) {
            throw new NotFoundException('Client not found');
        }

        // Check if company name already exists (excluding current client)
        if (updateRequest.companyName) {
            const existingClient = await this.clientModel.findOne({
                companyName: updateRequest.companyName,
                _id: {$ne: id}
            });

            if (existingClient) {
                throw new ConflictException('Company name already exists');
            }
        }

        // Check if email already exists (excluding current client)
        if (updateRequest.email) {
            const existingEmail = await this.clientModel.findOne({
                email: updateRequest.email,
                _id: {$ne: id}
            });

            if (existingEmail) {
                throw new ConflictException('Email already exists');
            }
        }

        // Apply updates
        Object.assign(client, updateRequest);
        client.updatedAt = new Date();

        const updatedClient = await client.save();
        return this.mapToResponse(updatedClient);
    }

    /**
     * Deactivate client
     */
    async deactivateClient(id: string): Promise<IClientResponse> {
        return this.updateClient(id, {isActive: false});
    }

    /**
     * Activate client
     */
    async activateClient(id: string): Promise<IClientResponse> {
        return this.updateClient(id, {isActive: true});
    }

    /**
     * Regenerate API key
     */
    async regenerateApiKey(id: string): Promise<IClientResponse> {
        const client = await this.clientModel.findById(id);

        if (!client) {
            throw new NotFoundException('Client not found');
        }

        client.apiKey = this.generateApiKey();
        client.updatedAt = new Date();

        const updatedClient = await client.save();
        return this.mapToResponse(updatedClient);
    }

    /**
     * Map client to response
     */
    private mapToResponse(client: Client): IClientResponse {
        return {
            id: (client as any)._id.toString(),
            companyName: client.companyName,
            email: client.email,
            role: client.role,
            apiKey: client.apiKey,
            isActive: client.isActive,
            createdAt: client.createdAt,
            updatedAt: client.updatedAt,
        };
    }
}
