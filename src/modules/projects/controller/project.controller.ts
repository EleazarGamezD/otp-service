import {
    IProjectCreateRequest,
    IProjectResponse,
    IProjectUpdateRequest
} from '@app/core/interfaces/projects/project.interface';
import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
    Post,
    Put,
    Request,
    UseGuards
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiBody,
    ApiOperation,
    ApiResponse,
    ApiTags
} from '@nestjs/swagger';
import {Types} from 'mongoose';
import {ClientJwtGuard} from '../../client-auth/guard/client-jwt.guard';
import {ProjectService} from '../service/project.service';

@ApiTags('Customer Projects')
@Controller('projects')
@UseGuards(ClientJwtGuard)
@ApiBearerAuth('client-jwt')
export class ProjectController {
    constructor(private readonly projectService: ProjectService) { }

    @Post()
    @ApiOperation({
        summary: 'Create new project',
        description: 'Create a new project for the authenticated customer'
    })
    @ApiBody({
        description: 'Project creation data',
        schema: {
            type: 'object',
            required: ['name'],
            properties: {
                name: {
                    type: 'string',
                    description: 'Project name',
                    example: 'My E-commerce OTP'
                },
                description: {
                    type: 'string',
                    description: 'Project description',
                    example: 'OTP verification for user registration and login'
                },
                tokens: {
                    type: 'number',
                    description: 'Initial token allocation (admin only)',
                    example: 100,
                    minimum: 1
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
                        subject: {
                            type: 'string',
                            description: 'Email subject template',
                            example: 'Your OTP Code'
                        },
                        body: {
                            type: 'string',
                            description: 'Email body template with {{code}} placeholder',
                            example: '<h2>Your verification code</h2><p>Code: <strong>{{code}}</strong></p>'
                        }
                    }
                },
                whatsappTemplate: {
                    type: 'object',
                    properties: {
                        message: {
                            type: 'string',
                            description: 'WhatsApp message template with {{code}} placeholder',
                            example: 'Your verification code is: {{code}}'
                        }
                    }
                }
            }
        }
    })
    @ApiResponse({
        status: 201,
        description: 'Project created successfully'
    })
    async createProject(
        @Body() createRequest: IProjectCreateRequest,
        @Request() req: any
    ): Promise<IProjectResponse> {
        const clientId = new Types.ObjectId(req.user.sub);
        return this.projectService.createProject(clientId, createRequest);
    }

    @Get()
    @ApiOperation({
        summary: 'Get my projects',
        description: 'Retrieve all projects belonging to the authenticated customer'
    })
    @ApiResponse({
        status: 200,
        description: 'Projects retrieved successfully',
        schema: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: {type: 'string'},
                    projectId: {type: 'string'},
                    name: {type: 'string'},
                    description: {type: 'string'},
                    isActive: {type: 'boolean'},
                    hasUnlimitedTokens: {type: 'boolean'},
                    isProduction: {type: 'boolean'},
                    tokens: {type: 'number'},
                    tokensUsed: {type: 'number'},
                    remainingTokens: {type: 'number'},
                    rateLimitPerMinute: {type: 'number'},
                    otpExpirationSeconds: {type: 'number'},
                    createdAt: {type: 'string', format: 'date-time'},
                    updatedAt: {type: 'string', format: 'date-time'}
                }
            }
        }
    })
    async getMyProjects(@Request() req: any): Promise<IProjectResponse[]> {
        const clientId = new Types.ObjectId(req.user.sub);
        return this.projectService.getProjectsByClientId(clientId);
    }

    @Get(':projectId')
    @ApiOperation({
        summary: 'Get project by ID',
        description: 'Retrieve a specific project by its ID'
    })
    @ApiResponse({
        status: 200,
        description: 'Project retrieved successfully'
    })
    @ApiResponse({
        status: 404,
        description: 'Project not found'
    })
    async getProject(
        @Param('projectId') projectId: string,
        @Request() req: any
    ): Promise<IProjectResponse> {
        const clientId = new Types.ObjectId(req.user.sub);
        // Verificar que el proyecto pertenezca al cliente
        await this.projectService.verifyProjectOwnership(projectId, clientId);
        return this.projectService.getProjectByProjectId(projectId);
    }

    @Put(':projectId')
    @ApiOperation({
        summary: 'Update project',
        description: 'Update project settings (limited fields for customers)'
    })
    @ApiBody({
        description: 'Project update data',
        schema: {
            type: 'object',
            properties: {
                name: {
                    type: 'string',
                    description: 'Project name',
                    example: 'Updated Project Name'
                },
                description: {
                    type: 'string',
                    description: 'Project description',
                    example: 'Updated description'
                },
                rateLimitPerMinute: {
                    type: 'number',
                    description: 'Rate limit per minute',
                    example: 15,
                    minimum: 1,
                    maximum: 100
                },
                otpExpirationSeconds: {
                    type: 'number',
                    description: 'OTP expiration time in seconds',
                    example: 600,
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
    @ApiResponse({
        status: 200,
        description: 'Project updated successfully'
    })
    @ApiResponse({
        status: 404,
        description: 'Project not found'
    })
    async updateProject(
        @Param('projectId') projectId: string,
        @Body() updateRequest: IProjectUpdateRequest,
        @Request() req: any
    ): Promise<IProjectResponse> {
        const clientId = new Types.ObjectId(req.user.sub);
        const project = await this.projectService.verifyProjectOwnership(projectId, clientId);

        // Los clientes no pueden cambiar algunos campos críticos
        const allowedUpdates: IProjectUpdateRequest = {
            name: updateRequest.name,
            description: updateRequest.description,
            rateLimitPerMinute: updateRequest.rateLimitPerMinute,
            otpExpirationSeconds: updateRequest.otpExpirationSeconds,
            emailTemplate: updateRequest.emailTemplate,
            whatsappTemplate: updateRequest.whatsappTemplate
        };

        return this.projectService.updateProject((project as any)._id.toString(), allowedUpdates);
    }

    @Patch(':projectId/deactivate')
    @ApiOperation({
        summary: 'Deactivate project',
        description: 'Deactivate a project (stops OTP generation)'
    })
    @ApiResponse({
        status: 200,
        description: 'Project deactivated successfully'
    })
    @ApiResponse({
        status: 404,
        description: 'Project not found'
    })
    async deactivateProject(
        @Param('projectId') projectId: string,
        @Request() req: any
    ): Promise<IProjectResponse> {
        const clientId = new Types.ObjectId(req.user.sub);
        const project = await this.projectService.verifyProjectOwnership(projectId, clientId);
        return this.projectService.deactivateProject((project as any)._id.toString());
    }

    @Patch(':projectId/activate')
    @ApiOperation({
        summary: 'Activate project',
        description: 'Activate a project (resumes OTP generation)'
    })
    @ApiResponse({
        status: 200,
        description: 'Project activated successfully'
    })
    @ApiResponse({
        status: 404,
        description: 'Project not found'
    })
    async activateProject(
        @Param('projectId') projectId: string,
        @Request() req: any
    ): Promise<IProjectResponse> {
        const clientId = new Types.ObjectId(req.user.sub);
        const project = await this.projectService.verifyProjectOwnership(projectId, clientId);
        return this.projectService.activateProject((project as any)._id.toString());
    }
}
