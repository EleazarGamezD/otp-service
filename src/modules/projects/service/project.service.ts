import {Project} from '@app/core/database/schemas/projects/project.schema';
import {
    IProjectCreateRequest,
    IProjectResponse,
    IProjectUpdateRequest,
    ITokenConsumptionResponse
} from '@app/core/interfaces/projects/project.interface';
import {Injectable, NotFoundException} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Model, Types} from 'mongoose';
import {v4 as uuidv4} from 'uuid';

@Injectable()
export class ProjectService {
    constructor(
        @InjectModel(Project.name) private projectModel: Model<Project>,
    ) { }

    /**
     * Genera un ID único para el proyecto
     */
    private generateProjectId(): string {
        return `PRJ_${uuidv4().replace(/-/g, '').substring(0, 12).toUpperCase()}`;
    }

    /**
     * Crea un nuevo proyecto para un cliente
     */
    async createProject(
        clientId: Types.ObjectId,
        createRequest: IProjectCreateRequest
    ): Promise<IProjectResponse> {
        const projectId = this.generateProjectId();

        const project = new this.projectModel({
            projectId,
            clientId,
            name: createRequest.name,
            description: createRequest.description,
            tokens: createRequest.tokens || 20, // Proyectos nuevos empiezan con 20 tokens
            rateLimitPerMinute: createRequest.rateLimitPerMinute || 5,
            otpExpirationSeconds: createRequest.otpExpirationSeconds || 300,
            emailTemplate: createRequest.emailTemplate || undefined, // Usará el default del schema
            whatsappTemplate: createRequest.whatsappTemplate || undefined, // Usará el default del schema
        });

        const savedProject = await project.save();
        return this.mapToResponse(savedProject);
    }

    /**
     * Obtiene todos los proyectos de un cliente
     */
    async getProjectsByClientId(clientId: Types.ObjectId): Promise<IProjectResponse[]> {
        const projects = await this.projectModel
            .find({clientId, isActive: true})
            .sort({createdAt: -1})
            .exec();

        return projects.map(project => this.mapToResponse(project));
    }

    /**
     * Obtiene un proyecto por su ID público
     */
    async getProjectByProjectId(projectId: string): Promise<IProjectResponse> {
        const project = await this.projectModel
            .findOne({projectId, isActive: true})
            .exec();

        if (!project) {
            throw new NotFoundException('Project not found');
        }

        return this.mapToResponse(project);
    }

    /**
     * Obtiene un proyecto por su ObjectId interno
     */
    async getProjectById(id: string): Promise<IProjectResponse> {
        const project = await this.projectModel
            .findById(id)
            .exec();

        if (!project) {
            throw new NotFoundException('Project not found');
        }

        return this.mapToResponse(project);
    }

    /**
     * Verifica si un proyecto pertenece a un cliente
     */
    async verifyProjectOwnership(projectId: string, clientId: Types.ObjectId): Promise<Project> {
        const project = await this.projectModel
            .findOne({projectId, clientId, isActive: true})
            .exec();

        if (!project) {
            throw new NotFoundException('Project not found or access denied');
        }

        return project;
    }

    /**
     * Actualiza un proyecto
     */
    async updateProject(
        id: string,
        updateRequest: IProjectUpdateRequest
    ): Promise<IProjectResponse> {
        const project = await this.projectModel
            .findById(id)
            .exec();

        if (!project) {
            throw new NotFoundException('Project not found');
        }

        // Aplicar actualizaciones
        Object.assign(project, updateRequest);
        project.updatedAt = new Date();

        const updatedProject = await project.save();
        return this.mapToResponse(updatedProject);
    }

    /**
     * Añade tokens a un proyecto
     */
    async addTokens(id: string, tokensToAdd: number): Promise<IProjectResponse> {
        const project = await this.projectModel
            .findById(id)
            .exec();

        if (!project) {
            throw new NotFoundException('Project not found');
        }

        project.tokens += tokensToAdd;
        project.updatedAt = new Date();

        const updatedProject = await project.save();
        return this.mapToResponse(updatedProject);
    }

    /**
     * Consume un token del proyecto
     */
    async consumeToken(projectId: string): Promise<ITokenConsumptionResponse> {
        const project = await this.projectModel
            .findOne({projectId, isActive: true})
            .exec();

        if (!project) {
            throw new NotFoundException('Project not found');
        }

        if (!project.isActive) {
            return {
                tokensRemaining: project.tokens - project.tokensUsed,
                tokensUsed: project.tokensUsed,
                canProceed: false,
                reason: 'Project is not active'
            };
        }

        // Si tiene tokens ilimitados, puede proceder sin consumir
        if (project.hasUnlimitedTokens) {
            return {
                tokensRemaining: -1, // -1 indica ilimitado
                tokensUsed: project.tokensUsed,
                canProceed: true
            };
        }

        const remainingTokens = project.tokens - project.tokensUsed;

        if (remainingTokens <= 0) {
            return {
                tokensRemaining: 0,
                tokensUsed: project.tokensUsed,
                canProceed: false,
                reason: 'Insufficient tokens'
            };
        }

        // Consumir el token
        project.tokensUsed += 1;
        project.updatedAt = new Date();
        await project.save();

        return {
            tokensRemaining: project.tokens - project.tokensUsed,
            tokensUsed: project.tokensUsed,
            canProceed: true
        };
    }

    /**
     * Desactiva un proyecto
     */
    async deactivateProject(id: string): Promise<IProjectResponse> {
        const project = await this.projectModel
            .findById(id)
            .exec();

        if (!project) {
            throw new NotFoundException('Project not found');
        }

        project.isActive = false;
        project.updatedAt = new Date();

        const updatedProject = await project.save();
        return this.mapToResponse(updatedProject);
    }

    /**
     * Activa un proyecto
     */
    async activateProject(id: string): Promise<IProjectResponse> {
        const project = await this.projectModel
            .findById(id)
            .exec();

        if (!project) {
            throw new NotFoundException('Project not found');
        }

        project.isActive = true;
        project.updatedAt = new Date();

        const updatedProject = await project.save();
        return this.mapToResponse(updatedProject);
    }

    /**
     * Obtiene todos los proyectos (solo para admin)
     */
    async getAllProjects(): Promise<IProjectResponse[]> {
        const projects = await this.projectModel
            .find()
            .sort({createdAt: -1})
            .exec();

        return projects.map(project => this.mapToResponse(project));
    }

    /**
     * Mapea un documento de proyecto a respuesta
     */
    private mapToResponse(project: Project): IProjectResponse {
        return {
            id: (project as any)._id.toString(),
            projectId: project.projectId,
            clientId: project.clientId.toString(),
            name: project.name,
            description: project.description,
            isActive: project.isActive,
            hasUnlimitedTokens: project.hasUnlimitedTokens,
            isProduction: project.isProduction,
            tokens: project.tokens,
            tokensUsed: project.tokensUsed,
            remainingTokens: project.hasUnlimitedTokens ? -1 : project.tokens - project.tokensUsed,
            rateLimitPerMinute: project.rateLimitPerMinute,
            otpExpirationSeconds: project.otpExpirationSeconds,
            otpExpirationMinutes: Math.round(project.otpExpirationSeconds / 60),
            emailTemplate: project.emailTemplate,
            whatsappTemplate: project.whatsappTemplate,
            createdAt: project.createdAt,
            updatedAt: project.updatedAt,
        };
    }
}
