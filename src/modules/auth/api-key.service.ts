import {ForbiddenException, Inject, Injectable, UnauthorizedException, forwardRef} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Model} from 'mongoose';
import {Client} from '../../core/database/schemas/clients/client.schema';
import {ProjectService} from '../projects/service/project.service';

@Injectable()
export class ApiKeyService {
  constructor(
    @InjectModel(Client.name) private clientModel: Model<Client>,
    @Inject(forwardRef(() => ProjectService))
    private projectService: ProjectService,
  ) { }

  /**
   * Validate API key and project ID
   */
  async validateApiKeyAndProject(apiKey: string, projectId: string): Promise<{client: Client, project: any}> {
    if (!apiKey) {
      throw new UnauthorizedException('API key is required');
    }

    if (!projectId) {
      throw new UnauthorizedException('Project ID is required');
    }

    // Find client by API key
    const client = await this.clientModel.findOne({apiKey});

    if (!client) {
      throw new UnauthorizedException('Invalid API key');
    }

    if (!client.isActive) {
      throw new ForbiddenException('Client account is inactive');
    }

    // Verify that the project belongs to this client
    try {
      const project = await this.projectService.verifyProjectOwnership(projectId, client._id as any);

      if (!project.isActive) {
        throw new ForbiddenException('Project is inactive');
      }

      return {client, project};
    } catch (error) {
      throw new UnauthorizedException('Invalid project ID or access denied');
    }
  }

  /**
   * Legacy method for backward compatibility - only validates API key
   */
  async validateApiKey(apiKey: string): Promise<Client> {
    if (!apiKey) {
      throw new UnauthorizedException('API key is required');
    }

    const client = await this.clientModel.findOne({apiKey});

    if (!client) {
      throw new UnauthorizedException('Invalid API key');
    }

    if (!client.isActive) {
      throw new ForbiddenException('Client account is inactive');
    }

    return client;
  }

  /**
   * Check if project has sufficient tokens (or unlimited)
   */
  async hasTokens(projectId: string): Promise<boolean> {
    try {
      const project = await this.projectService.getProjectByProjectId(projectId);

      if (project.hasUnlimitedTokens) {
        return true;
      }

      return project.remainingTokens > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get token information for a project
   */
  async getTokenInfo(projectId: string): Promise<{
    tokens: number;
    tokensUsed: number;
    remainingTokens: number;
    hasUnlimitedTokens: boolean;
  }> {
    const project = await this.projectService.getProjectByProjectId(projectId);

    return {
      tokens: project.tokens,
      tokensUsed: project.tokensUsed,
      remainingTokens: project.remainingTokens,
      hasUnlimitedTokens: project.hasUnlimitedTokens
    };
  }
}
