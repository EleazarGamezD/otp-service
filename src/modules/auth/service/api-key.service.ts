import {ForbiddenException, Injectable, UnauthorizedException} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Model} from 'mongoose';
import {Client} from '../../../core/database/schemas/clients/client.schema';

@Injectable()
export class ApiKeyService {
  constructor(@InjectModel(Client.name) private clientModel: Model<Client>) { }

  /**
   * Validate API key and return client if valid and active
   */
  async validateApiKey(apiKey: string): Promise<Client> {
    if (!apiKey) {
      throw new UnauthorizedException('API key is required');
    }

    // Check if API key has the correct production format
    if (!apiKey.startsWith('prod_')) {
      throw new UnauthorizedException('Invalid API key format');
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
   * Validate API key for OTP operations (includes token check)
   */
  async validateForOtpOperation(apiKey: string): Promise<Client> {
    const client = await this.validateApiKey(apiKey);

    const remainingTokens = client.tokens - client.tokensUsed;

    if (remainingTokens <= 0) {
      throw new ForbiddenException('No tokens remaining. Please contact support to add more tokens.');
    }

    return client;
  }

  /**
   * Check if client has sufficient tokens
   */
  async hasTokens(apiKey: string): Promise<boolean> {
    try {
      const client = await this.validateApiKey(apiKey);
      return (client.tokens - client.tokensUsed) > 0;
    } catch {
      return false;
    }
  }

  /**
   * Get client token information
   */
  async getTokenInfo(apiKey: string): Promise<{tokens: number; tokensUsed: number; remainingTokens: number}> {
    const client = await this.validateApiKey(apiKey);

    return {
      tokens: client.tokens,
      tokensUsed: client.tokensUsed,
      remainingTokens: client.tokens - client.tokensUsed
    };
  }
}
