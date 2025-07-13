import {IClientAuthResponse, IClientChangePasswordRequest, IClientLoginRequest, IClientProfileResponse, IClientRegisterRequest} from '@app/core/interfaces/client-auth/client-auth.interface';
import {Body, Controller, Get, Post, Put} from '@nestjs/common';
import {ApiBody, ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import {ClientAuth} from '../decorator/client-auth.decorator';
import {CurrentClient} from '../decorator/current-client.decorator';
import {ClientAuthService} from '../service/client-auth.service';

@ApiTags('Customer Authentication')
@Controller('auth/customer')
export class ClientAuthController {
    constructor(private readonly clientAuthService: ClientAuthService) { }

    @Post('register')
    @ApiOperation({
        summary: 'Register new customer',
        description: 'Register a new customer account with email and password. Generates a test API key with 20 tokens.'
    })
    @ApiBody({
        description: 'Customer registration data',
        schema: {
            type: 'object',
            required: ['companyName', 'email', 'password'],
            properties: {
                companyName: {
                    type: 'string',
                    description: 'Company name',
                    example: 'Acme Corp'
                },
                email: {
                    type: 'string',
                    format: 'email',
                    description: 'Customer email address',
                    example: 'admin@acme.com'
                },
                password: {
                    type: 'string',
                    minLength: 8,
                    description: 'Strong password (min 8 chars, uppercase, lowercase, number, special char)',
                    example: 'MySecure123!'
                }
            }
        }
    })
    @ApiResponse({
        status: 201,
        description: 'Customer registered successfully',
        schema: {
            type: 'object',
            properties: {
                accessToken: {
                    type: 'string',
                    description: 'JWT access token for authentication'
                },
                client: {
                    type: 'object',
                    properties: {
                        id: {type: 'string'},
                        companyName: {type: 'string'},
                        email: {type: 'string'},
                        role: {type: 'string', example: 'customer'},
                        apiKey: {type: 'string', description: 'Test API key with test_ prefix'},
                        isActive: {type: 'boolean'},
                        hasUnlimitedTokens: {type: 'boolean'},
                        isProduction: {type: 'boolean'},
                        tokens: {type: 'number', example: 20},
                        tokensUsed: {type: 'number'}
                    }
                }
            }
        }
    })
    @ApiResponse({
        status: 409,
        description: 'Email or company name already exists',
        schema: {
            type: 'object',
            properties: {
                statusCode: {type: 'number', example: 409},
                message: {type: 'string', example: 'El email ya está registrado'},
                error: {type: 'string', example: 'Conflict'}
            }
        }
    })
    async register(@Body() registerRequest: IClientRegisterRequest): Promise<IClientAuthResponse> {
        return this.clientAuthService.register(registerRequest);
    }

    @Post('login')
    @ApiOperation({
        summary: 'Customer login',
        description: 'Authenticate customer with email and password'
    })
    @ApiBody({
        description: 'Customer login credentials',
        schema: {
            type: 'object',
            required: ['email', 'password'],
            properties: {
                email: {
                    type: 'string',
                    format: 'email',
                    description: 'Customer email address',
                    example: 'admin@acme.com'
                },
                password: {
                    type: 'string',
                    description: 'Customer password',
                    example: 'MySecure123!'
                }
            }
        }
    })
    @ApiResponse({
        status: 200,
        description: 'Login successful',
        schema: {
            type: 'object',
            properties: {
                accessToken: {
                    type: 'string',
                    description: 'JWT access token for authentication'
                },
                client: {
                    type: 'object',
                    properties: {
                        id: {type: 'string'},
                        companyName: {type: 'string'},
                        email: {type: 'string'},
                        role: {type: 'string'},
                        apiKey: {type: 'string'},
                        isActive: {type: 'boolean'},
                        hasUnlimitedTokens: {type: 'boolean'},
                        isProduction: {type: 'boolean'},
                        tokens: {type: 'number'},
                        tokensUsed: {type: 'number'}
                    }
                }
            }
        }
    })
    @ApiResponse({
        status: 401,
        description: 'Invalid credentials or account deactivated',
        schema: {
            type: 'object',
            properties: {
                statusCode: {type: 'number', example: 401},
                message: {type: 'string', example: 'Credenciales inválidas'},
                error: {type: 'string', example: 'Unauthorized'}
            }
        }
    })
    async login(@Body() loginRequest: IClientLoginRequest): Promise<IClientAuthResponse> {
        return this.clientAuthService.login(loginRequest);
    }

    @Get('profile')
    @ClientAuth()
    @ApiOperation({
        summary: 'Get customer profile',
        description: 'Get current customer profile information'
    })
    @ApiResponse({
        status: 200,
        description: 'Customer profile retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                id: {type: 'string'},
                companyName: {type: 'string'},
                email: {type: 'string'},
                role: {type: 'string'},
                apiKey: {type: 'string'},
                isActive: {type: 'boolean'},
                hasUnlimitedTokens: {type: 'boolean'},
                isProduction: {type: 'boolean'},
                tokens: {type: 'number'},
                tokensUsed: {type: 'number'},
                rateLimitPerMinute: {type: 'number'},
                otpExpirationSeconds: {type: 'number'},
                createdAt: {type: 'string', format: 'date-time'},
                updatedAt: {type: 'string', format: 'date-time'}
            }
        }
    })
    async getProfile(@CurrentClient() client: any): Promise<IClientProfileResponse> {
        return this.clientAuthService.getProfile(client._id.toString());
    }

    @Put('change-password')
    @ClientAuth()
    @ApiOperation({
        summary: 'Change customer password',
        description: 'Change current customer password. Requires current password verification.'
    })
    @ApiBody({
        description: 'Password change request',
        schema: {
            type: 'object',
            required: ['currentPassword', 'newPassword'],
            properties: {
                currentPassword: {
                    type: 'string',
                    description: 'Current password',
                    example: 'MyOldPassword123!'
                },
                newPassword: {
                    type: 'string',
                    minLength: 8,
                    description: 'New strong password (min 8 chars, uppercase, lowercase, number, special char)',
                    example: 'MyNewSecure456!'
                }
            }
        }
    })
    @ApiResponse({
        status: 200,
        description: 'Password changed successfully',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    example: 'Contraseña actualizada exitosamente'
                }
            }
        }
    })
    @ApiResponse({
        status: 401,
        description: 'Current password incorrect',
        schema: {
            type: 'object',
            properties: {
                statusCode: {type: 'number', example: 401},
                message: {type: 'string', example: 'Contraseña actual incorrecta'},
                error: {type: 'string', example: 'Unauthorized'}
            }
        }
    })
    async changePassword(
        @CurrentClient() client: any,
        @Body() changePasswordRequest: IClientChangePasswordRequest
    ): Promise<{message: string}> {
        return this.clientAuthService.changePassword(client._id.toString(), changePasswordRequest);
    }
}
