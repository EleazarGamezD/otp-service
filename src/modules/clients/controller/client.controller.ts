import {IClientCreateRequest, IClientResponse, IClientUpdateRequest} from '@app/core/interfaces/clients/client.interface';
import {Body, Controller, Get, Param, Patch, Post, Put} from '@nestjs/common';
import {ApiBody, ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import {AdminAuth} from '../../admin-auth/decorator/admin-auth.decorator';
import {ClientService} from '../service/client.service';

@ApiTags('Client Management')
@Controller('clients')
@AdminAuth()
export class ClientController {
    constructor(private readonly clientService: ClientService) { }

    @Post()
    @ApiOperation({
        summary: 'Create new client',
        description: 'Register a new client with API key generation'
    })
    @ApiBody({
        description: 'Client creation data',
        schema: {
            type: 'object',
            required: ['companyName'],
            properties: {
                companyName: {
                    type: 'string',
                    description: 'Company name',
                    example: 'Acme Corp'
                },
                tokens: {
                    type: 'number',
                    description: 'Initial token allocation',
                    example: 100,
                    minimum: 0
                },
                rateLimitPerMinute: {
                    type: 'number',
                    description: 'Rate limit per minute',
                    example: 5,
                    minimum: 1,
                    maximum: 100
                },
                otpExpirationSeconds: {
                    type: 'number',
                    description: 'OTP expiration time in seconds',
                    example: 300,
                    minimum: 60,
                    maximum: 3600
                },
                emailTemplate: {
                    type: 'object',
                    properties: {
                        subject: {
                            type: 'string',
                            example: 'Your verification code'
                        },
                        body: {
                            type: 'string',
                            example: '<h2>Verification Code</h2><p>Your code is: <strong>{{code}}</strong></p>'
                        }
                    }
                },
                whatsappTemplate: {
                    type: 'object',
                    properties: {
                        message: {
                            type: 'string',
                            example: 'Your verification code is: {{code}}. Expires in 15 minutes.'
                        }
                    }
                }
            }
        }
    })
    @ApiResponse({
        status: 201,
        description: 'Client created successfully',
        schema: {
            type: 'object',
            properties: {
                id: {type: 'string'},
                companyName: {type: 'string'},
                apiKey: {type: 'string'},
                isActive: {type: 'boolean'},
                tokens: {type: 'number'},
                tokensUsed: {type: 'number'},
                remainingTokens: {type: 'number'},
                rateLimitPerMinute: {type: 'number'},
                otpExpirationSeconds: {type: 'number'},
                otpExpirationMinutes: {type: 'number'},
                createdAt: {type: 'string', format: 'date-time'},
                updatedAt: {type: 'string', format: 'date-time'}
            }
        }
    })
    @ApiResponse({status: 409, description: 'Company name already exists'})
    async createClient(@Body() createRequest: IClientCreateRequest): Promise<IClientResponse> {
        return this.clientService.createClient(createRequest);
    }

    @Get()
    @ApiOperation({
        summary: 'Get all clients',
        description: 'Retrieve all registered clients'
    })
    @ApiResponse({
        status: 200,
        description: 'List of clients retrieved successfully',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: {type: 'string'},
                    companyName: {type: 'string'},
                    apiKey: {type: 'string'},
                    isActive: {type: 'boolean'},
                    tokens: {type: 'number'},
                    tokensUsed: {type: 'number'},
                    remainingTokens: {type: 'number'},
                    rateLimitPerMinute: {type: 'number'},
                    createdAt: {type: 'string', format: 'date-time'},
                    updatedAt: {type: 'string', format: 'date-time'}
                }
            }
        }
    })
    async getAllClients(): Promise<IClientResponse[]> {
        return this.clientService.findAll();
    }

    @Get(':id')
    @ApiOperation({
        summary: 'Get client by ID',
        description: 'Retrieve a specific client by ID'
    })
    @ApiResponse({
        status: 200,
        description: 'Client retrieved successfully'
    })
    @ApiResponse({status: 404, description: 'Client not found'})
    async getClientById(@Param('id') id: string): Promise<IClientResponse> {
        return this.clientService.findById(id);
    }

    @Put(':id')
    @ApiOperation({
        summary: 'Update client',
        description: 'Update client information'
    })
    @ApiBody({
        description: 'Client update data',
        schema: {
            type: 'object',
            properties: {
                companyName: {
                    type: 'string',
                    description: 'Company name',
                    example: 'Acme Corp Updated'
                },
                isActive: {
                    type: 'boolean',
                    description: 'Client active status',
                    example: true
                },
                tokens: {
                    type: 'number',
                    description: 'Total token allocation',
                    example: 200,
                    minimum: 0
                },
                rateLimitPerMinute: {
                    type: 'number',
                    description: 'Rate limit per minute',
                    example: 10,
                    minimum: 1,
                    maximum: 100
                },
                otpExpirationSeconds: {
                    type: 'number',
                    description: 'OTP expiration time in seconds',
                    example: 300,
                    minimum: 60,
                    maximum: 3600
                },
                emailTemplate: {
                    type: 'object',
                    properties: {
                        subject: {type: 'string'},
                        body: {type: 'string'}
                    }
                },
                whatsappTemplate: {
                    type: 'object',
                    properties: {
                        message: {type: 'string'}
                    }
                }
            }
        }
    })
    @ApiResponse({status: 200, description: 'Client updated successfully'})
    @ApiResponse({status: 404, description: 'Client not found'})
    @ApiResponse({status: 409, description: 'Company name already exists'})
    async updateClient(
        @Param('id') id: string,
        @Body() updateRequest: IClientUpdateRequest
    ): Promise<IClientResponse> {
        return this.clientService.updateClient(id, updateRequest);
    }

    @Patch(':id/deactivate')
    @ApiOperation({
        summary: 'Deactivate client',
        description: 'Deactivate a client account'
    })
    @ApiResponse({status: 200, description: 'Client deactivated successfully'})
    @ApiResponse({status: 404, description: 'Client not found'})
    async deactivateClient(@Param('id') id: string): Promise<IClientResponse> {
        return this.clientService.deactivateClient(id);
    }

    @Patch(':id/activate')
    @ApiOperation({
        summary: 'Activate client',
        description: 'Activate a client account'
    })
    @ApiResponse({status: 200, description: 'Client activated successfully'})
    @ApiResponse({status: 404, description: 'Client not found'})
    async activateClient(@Param('id') id: string): Promise<IClientResponse> {
        return this.clientService.activateClient(id);
    }

    @Patch(':id/add-tokens')
    @ApiOperation({
        summary: 'Add tokens to client',
        description: 'Add tokens to client account'
    })
    @ApiBody({
        description: 'Tokens to add',
        schema: {
            type: 'object',
            required: ['tokens'],
            properties: {
                tokens: {
                    type: 'number',
                    description: 'Number of tokens to add',
                    example: 50,
                    minimum: 1
                }
            }
        }
    })
    @ApiResponse({status: 200, description: 'Tokens added successfully'})
    @ApiResponse({status: 404, description: 'Client not found'})
    async addTokens(
        @Param('id') id: string,
        @Body() body: {tokens: number}
    ): Promise<IClientResponse> {
        return this.clientService.addTokens(id, body.tokens);
    }

    @Post(':id/regenerate-api-key')
    @ApiOperation({
        summary: 'Regenerate API key',
        description: 'Generate a new API key for the client'
    })
    @ApiResponse({status: 200, description: 'API key regenerated successfully'})
    @ApiResponse({status: 404, description: 'Client not found'})
    async regenerateApiKey(@Param('id') id: string): Promise<IClientResponse> {
        return this.clientService.regenerateApiKey(id);
    }
}
