import {IClientResponse, IClientUpdateRequest} from '@app/core/interfaces/clients/client.interface';
import {Body, Controller, Get, Param, Patch, Post, Put} from '@nestjs/common';
import {ApiBody, ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import {AdminAuth} from '../../admin-auth/decorator/admin-auth.decorator';
import {ClientService} from '../service/client.service';

@ApiTags('Admin - Customer Management')
@Controller('admin/customers')
@AdminAuth()
export class ClientController {
    constructor(private readonly clientService: ClientService) { }

    @Get()
    @ApiOperation({
        summary: 'Get all customers',
        description: 'Retrieve all registered customers with their details, tokens, and status'
    })
    @ApiResponse({
        status: 200,
        description: 'List of customers retrieved successfully',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: {type: 'string'},
                    companyName: {type: 'string'},
                    email: {type: 'string'},
                    role: {type: 'string', enum: ['admin', 'customer']},
                    apiKey: {type: 'string'},
                    isActive: {type: 'boolean'},
                    tokens: {type: 'number'},
                    tokensUsed: {type: 'number'},
                    remainingTokens: {type: 'number'},
                    hasUnlimitedTokens: {type: 'boolean'},
                    isProduction: {type: 'boolean'},
                    rateLimitPerMinute: {type: 'number'},
                    createdAt: {type: 'string', format: 'date-time'},
                    updatedAt: {type: 'string', format: 'date-time'}
                }
            }
        }
    })
    async getAllCustomers(): Promise<IClientResponse[]> {
        return this.clientService.findAll();
    }

    @Get(':id')
    @ApiOperation({
        summary: 'Get customer by ID',
        description: 'Retrieve a specific customer by ID'
    })
    @ApiResponse({
        status: 200,
        description: 'Customer retrieved successfully'
    })
    @ApiResponse({status: 404, description: 'Customer not found'})
    async getCustomerById(@Param('id') id: string): Promise<IClientResponse> {
        return this.clientService.findById(id);
    }

    @Put(':id')
    @ApiOperation({
        summary: 'Update customer',
        description: 'Update customer information including tokens and settings'
    })
    @ApiBody({
        description: 'Customer update data',
        schema: {
            type: 'object',
            properties: {
                companyName: {
                    type: 'string',
                    description: 'Company name',
                    example: 'Acme Corp Updated'
                },
                email: {
                    type: 'string',
                    description: 'Customer email',
                    example: 'admin@acmecorp.com'
                },
                isActive: {
                    type: 'boolean',
                    description: 'Customer active status',
                    example: true
                },
                tokens: {
                    type: 'number',
                    description: 'Total token allocation',
                    example: 200,
                    minimum: 0
                },
                hasUnlimitedTokens: {
                    type: 'boolean',
                    description: 'Whether customer has unlimited tokens',
                    example: false
                },
                isProduction: {
                    type: 'boolean',
                    description: 'Whether customer is in production mode',
                    example: false
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
    @ApiResponse({status: 200, description: 'Customer updated successfully'})
    @ApiResponse({status: 404, description: 'Customer not found'})
    @ApiResponse({status: 409, description: 'Company name already exists'})
    async updateCustomer(
        @Param('id') id: string,
        @Body() updateRequest: IClientUpdateRequest
    ): Promise<IClientResponse> {
        return this.clientService.updateClient(id, updateRequest);
    }

    @Patch(':id/deactivate')
    @ApiOperation({
        summary: 'Deactivate customer',
        description: 'Deactivate a customer account'
    })
    @ApiResponse({status: 200, description: 'Customer deactivated successfully'})
    @ApiResponse({status: 404, description: 'Customer not found'})
    async deactivateCustomer(@Param('id') id: string): Promise<IClientResponse> {
        return this.clientService.deactivateClient(id);
    }

    @Patch(':id/activate')
    @ApiOperation({
        summary: 'Activate customer',
        description: 'Activate a customer account'
    })
    @ApiResponse({status: 200, description: 'Customer activated successfully'})
    @ApiResponse({status: 404, description: 'Customer not found'})
    async activateCustomer(@Param('id') id: string): Promise<IClientResponse> {
        return this.clientService.activateClient(id);
    }

    @Patch(':id/add-tokens')
    @ApiOperation({
        summary: 'Add tokens to customer',
        description: 'Add tokens to customer account'
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
    @ApiResponse({status: 404, description: 'Customer not found'})
    async addTokens(
        @Param('id') id: string,
        @Body() body: {tokens: number}
    ): Promise<IClientResponse> {
        return this.clientService.addTokens(id, body.tokens);
    }

    @Patch(':id/unlimited-tokens')
    @ApiOperation({
        summary: 'Toggle unlimited tokens',
        description: 'Enable or disable unlimited tokens for a customer'
    })
    @ApiBody({
        description: 'Unlimited tokens setting',
        schema: {
            type: 'object',
            required: ['hasUnlimitedTokens'],
            properties: {
                hasUnlimitedTokens: {
                    type: 'boolean',
                    description: 'Whether customer should have unlimited tokens',
                    example: true
                }
            }
        }
    })
    @ApiResponse({status: 200, description: 'Unlimited tokens setting updated successfully'})
    @ApiResponse({status: 404, description: 'Customer not found'})
    async toggleUnlimitedTokens(
        @Param('id') id: string,
        @Body() body: {hasUnlimitedTokens: boolean}
    ): Promise<IClientResponse> {
        return this.clientService.updateClient(id, {hasUnlimitedTokens: body.hasUnlimitedTokens});
    }

    @Patch(':id/production')
    @ApiOperation({
        summary: 'Promote to production',
        description: 'Promote customer to production environment'
    })
    @ApiBody({
        description: 'Production setting',
        schema: {
            type: 'object',
            required: ['isProduction'],
            properties: {
                isProduction: {
                    type: 'boolean',
                    description: 'Whether customer should be in production mode',
                    example: true
                }
            }
        }
    })
    @ApiResponse({status: 200, description: 'Production status updated successfully'})
    @ApiResponse({status: 404, description: 'Customer not found'})
    async toggleProduction(
        @Param('id') id: string,
        @Body() body: {isProduction: boolean}
    ): Promise<IClientResponse> {
        return this.clientService.updateClient(id, {isProduction: body.isProduction});
    }

    @Post(':id/regenerate-api-key')
    @ApiOperation({
        summary: 'Regenerate API key',
        description: 'Generate a new API key for the customer'
    })
    @ApiResponse({status: 200, description: 'API key regenerated successfully'})
    @ApiResponse({status: 404, description: 'Customer not found'})
    async regenerateApiKey(@Param('id') id: string): Promise<IClientResponse> {
        return this.clientService.regenerateApiKey(id);
    }
}
