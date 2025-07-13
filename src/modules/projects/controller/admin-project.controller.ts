import {
    IProjectResponse,
    IProjectUpdateRequest
} from '@app/core/interfaces/projects/project.interface';
import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
    Put
} from '@nestjs/common';
import {
    ApiBody,
    ApiOperation,
    ApiResponse,
    ApiTags
} from '@nestjs/swagger';
import {AdminAuth} from '../../admin-auth/decorator/admin-auth.decorator';
import {ProjectService} from '../service/project.service';

@ApiTags('Admin - Project Management')
@Controller('admin/projects')
@AdminAuth()
export class AdminProjectController {
    constructor(private readonly projectService: ProjectService) { }

    @Get()
    @ApiOperation({
        summary: 'Get all projects',
        description: 'Retrieve all projects from all customers'
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
                    clientId: {type: 'string'},
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
    async getAllProjects(): Promise<IProjectResponse[]> {
        return this.projectService.getAllProjects();
    }

    @Get(':id')
    @ApiOperation({
        summary: 'Get project by ID',
        description: 'Retrieve a specific project by its internal ID'
    })
    @ApiResponse({
        status: 200,
        description: 'Project retrieved successfully'
    })
    @ApiResponse({
        status: 404,
        description: 'Project not found'
    })
    async getProject(@Param('id') id: string): Promise<IProjectResponse> {
        return this.projectService.getProjectById(id);
    }

    @Put(':id')
    @ApiOperation({
        summary: 'Update project',
        description: 'Update project settings (admin has full access)'
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
                isActive: {
                    type: 'boolean',
                    description: 'Project active status',
                    example: true
                },
                tokens: {
                    type: 'number',
                    description: 'Total token allocation',
                    example: 500,
                    minimum: 0
                },
                hasUnlimitedTokens: {
                    type: 'boolean',
                    description: 'Whether project has unlimited tokens',
                    example: false
                },
                isProduction: {
                    type: 'boolean',
                    description: 'Whether project is in production mode',
                    example: true
                },
                rateLimitPerMinute: {
                    type: 'number',
                    description: 'Rate limit per minute',
                    example: 20,
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
        @Param('id') id: string,
        @Body() updateRequest: IProjectUpdateRequest
    ): Promise<IProjectResponse> {
        return this.projectService.updateProject(id, updateRequest);
    }

    @Patch(':id/add-tokens')
    @ApiOperation({
        summary: 'Add tokens to project',
        description: 'Add tokens to a project'
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
                    example: 100,
                    minimum: 1
                }
            }
        }
    })
    @ApiResponse({
        status: 200,
        description: 'Tokens added successfully'
    })
    @ApiResponse({
        status: 404,
        description: 'Project not found'
    })
    async addTokens(
        @Param('id') id: string,
        @Body() body: {tokens: number}
    ): Promise<IProjectResponse> {
        return this.projectService.addTokens(id, body.tokens);
    }

    @Patch(':id/unlimited-tokens')
    @ApiOperation({
        summary: 'Toggle unlimited tokens',
        description: 'Enable or disable unlimited tokens for a project'
    })
    @ApiBody({
        description: 'Unlimited tokens setting',
        schema: {
            type: 'object',
            required: ['hasUnlimitedTokens'],
            properties: {
                hasUnlimitedTokens: {
                    type: 'boolean',
                    description: 'Whether project should have unlimited tokens',
                    example: true
                }
            }
        }
    })
    @ApiResponse({
        status: 200,
        description: 'Unlimited tokens setting updated successfully'
    })
    @ApiResponse({
        status: 404,
        description: 'Project not found'
    })
    async toggleUnlimitedTokens(
        @Param('id') id: string,
        @Body() body: {hasUnlimitedTokens: boolean}
    ): Promise<IProjectResponse> {
        return this.projectService.updateProject(id, {hasUnlimitedTokens: body.hasUnlimitedTokens});
    }

    @Patch(':id/production')
    @ApiOperation({
        summary: 'Promote to production',
        description: 'Promote project to production environment'
    })
    @ApiBody({
        description: 'Production setting',
        schema: {
            type: 'object',
            required: ['isProduction'],
            properties: {
                isProduction: {
                    type: 'boolean',
                    description: 'Whether project should be in production mode',
                    example: true
                }
            }
        }
    })
    @ApiResponse({
        status: 200,
        description: 'Production status updated successfully'
    })
    @ApiResponse({
        status: 404,
        description: 'Project not found'
    })
    async toggleProduction(
        @Param('id') id: string,
        @Body() body: {isProduction: boolean}
    ): Promise<IProjectResponse> {
        return this.projectService.updateProject(id, {isProduction: body.isProduction});
    }

    @Patch(':id/activate')
    @ApiOperation({
        summary: 'Activate project',
        description: 'Activate a project'
    })
    @ApiResponse({
        status: 200,
        description: 'Project activated successfully'
    })
    @ApiResponse({
        status: 404,
        description: 'Project not found'
    })
    async activateProject(@Param('id') id: string): Promise<IProjectResponse> {
        return this.projectService.activateProject(id);
    }

    @Patch(':id/deactivate')
    @ApiOperation({
        summary: 'Deactivate project',
        description: 'Deactivate a project'
    })
    @ApiResponse({
        status: 200,
        description: 'Project deactivated successfully'
    })
    @ApiResponse({
        status: 404,
        description: 'Project not found'
    })
    async deactivateProject(@Param('id') id: string): Promise<IProjectResponse> {
        return this.projectService.deactivateProject(id);
    }
}
