import {OtpChannel} from '@app/core/enums/otp/channel.enum';
import {ApiKey} from '../../auth/decorator/api-key.decorator';
import {Body, Controller, Get, Post, Query, BadRequestException, Headers} from '@nestjs/common';
import {ApiBody, ApiOperation, ApiResponse, ApiSecurity, ApiTags, ApiQuery, ApiHeader} from '@nestjs/swagger';
import {OtpService} from '../otp.service';
import {ApiKeyService} from '../../auth/api-key.service';

interface IOtpGenerateRequest {
  target: string;
  channel: OtpChannel;
  recordId?: string;
  countryCode?: string;
}

interface IOtpVerifyRequest {
  target: string;
  code: string;
  recordId?: string;
}

@ApiTags('OTP')
@ApiSecurity('api-key')
@Controller('otp')
export class OtpController {
  constructor(
    private readonly otpService: OtpService,
    private readonly apiKeyService: ApiKeyService
  ) { }

  @Post('send')
  @ApiKey()
  @ApiOperation({
    summary: 'Send OTP',
    description: 'Generate and send a One-Time Password via email or WhatsApp for a specific project'
  })
  @ApiHeader({
    name: 'x-api-key',
    description: 'API Key for authentication',
    required: true
  })
  @ApiHeader({
    name: 'x-project-id',
    description: 'Project ID to send OTP for',
    required: true
  })
  @ApiBody({
    description: 'OTP send request',
    schema: {
      type: 'object',
      properties: {
        target: {
          type: 'string',
          description: 'Email address or phone number to send OTP to',
          example: 'user@example.com'
        },
        channel: {
          type: 'string',
          enum: [OtpChannel.EMAIL, OtpChannel.WHATSAPP],
          description: 'Channel to send OTP through',
          example: OtpChannel.EMAIL
        },
        recordId: {
          type: 'string',
          description: 'Optional unique identifier for tracking this OTP',
          example: 'order_12345'
        },
        countryCode: {
          type: 'string',
          description: 'Country code for WhatsApp (required for WhatsApp channel)',
          example: '+1'
        }
      },
      required: ['target', 'channel']
    }
  })
  @ApiResponse({
    status: 201,
    description: 'OTP sent successfully',
    schema: {
      type: 'object',
      properties: {
        message: {type: 'string', example: 'OTP generated and queued'},
        expiresIn: {type: 'number', example: 300},
        recordId: {type: 'string', example: '507f1f77bcf86cd799439011'}
      }
    }
  })
  @ApiResponse({status: 400, description: 'Bad request - Invalid input or insufficient tokens'})
  @ApiResponse({status: 401, description: 'Unauthorized - Invalid API key or project'})
  async sendOtp(
    @Body() dto: IOtpGenerateRequest,
    @Headers('x-api-key') apiKey: string,
    @Headers('x-project-id') projectId: string
  ) {
    if (!apiKey) {
      throw new BadRequestException('API key is required');
    }
    
    if (!projectId) {
      throw new BadRequestException('Project ID is required');
    }

    // Validate API key and project ownership
    await this.apiKeyService.validateApiKeyAndProject(apiKey, projectId);

    // Validate WhatsApp requirements
    if (dto.channel === OtpChannel.WHATSAPP && !dto.countryCode) {
      throw new BadRequestException('Country code is required for WhatsApp channel');
    }

    return this.otpService.generateOTP(
      projectId,
      dto.target,
      dto.channel,
      dto.recordId,
      dto.countryCode
    );
  }

  @Post('verify')
  @ApiKey()
  @ApiOperation({
    summary: 'Verify OTP',
    description: 'Verify a One-Time Password code for a specific project'
  })
  @ApiHeader({
    name: 'x-api-key',
    description: 'API Key for authentication',
    required: true
  })
  @ApiHeader({
    name: 'x-project-id',
    description: 'Project ID to verify OTP for',
    required: true
  })
  @ApiBody({
    description: 'OTP verification request',
    schema: {
      type: 'object',
      properties: {
        target: {
          type: 'string',
          description: 'Email address or phone number that received the OTP',
          example: 'user@example.com'
        },
        code: {
          type: 'string',
          description: 'The OTP code to verify',
          example: '123456'
        },
        recordId: {
          type: 'string',
          description: 'Optional record ID to verify specific OTP',
          example: 'order_12345'
        }
      },
      required: ['target', 'code']
    }
  })
  @ApiResponse({
    status: 200,
    description: 'OTP verification result',
    schema: {
      type: 'object',
      properties: {
        valid: {type: 'boolean', example: true},
        reason: {type: 'string', example: 'Valid code'},
        recordId: {type: 'string', example: '507f1f77bcf86cd799439011'},
        verifiedAt: {type: 'string', format: 'date-time'}
      }
    }
  })
  @ApiResponse({status: 400, description: 'Bad request - Invalid input'})
  @ApiResponse({status: 401, description: 'Unauthorized - Invalid API key or project'})
  async verifyOtp(
    @Body() dto: IOtpVerifyRequest,
    @Headers('x-api-key') apiKey: string,
    @Headers('x-project-id') projectId: string
  ) {
    if (!apiKey) {
      throw new BadRequestException('API key is required');
    }
    
    if (!projectId) {
      throw new BadRequestException('Project ID is required');
    }

    // Validate API key and project ownership
    await this.apiKeyService.validateApiKeyAndProject(apiKey, projectId);

    return this.otpService.verifyOTP(
      projectId,
      dto.target,
      dto.code,
      dto.recordId
    );
  }

  @Get('records')
  @ApiKey()
  @ApiOperation({
    summary: 'Get OTP records',
    description: 'Get OTP records for a project (for analytics and debugging)'
  })
  @ApiHeader({
    name: 'x-api-key',
    description: 'API Key for authentication',
    required: true
  })
  @ApiHeader({
    name: 'x-project-id',
    description: 'Project ID to get records for',
    required: true
  })
  @ApiQuery({name: 'page', required: false, type: Number, description: 'Page number'})
  @ApiQuery({name: 'limit', required: false, type: Number, description: 'Records per page'})
  @ApiQuery({name: 'channel', required: false, enum: OtpChannel, description: 'Filter by channel'})
  @ApiQuery({name: 'verified', required: false, type: Boolean, description: 'Filter by verification status'})
  @ApiResponse({
    status: 200,
    description: 'OTP records retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        records: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              target: {type: 'string'},
              channel: {type: 'string'},
              verified: {type: 'boolean'},
              recordId: {type: 'string'},
              createdAt: {type: 'string', format: 'date-time'},
              expiresAt: {type: 'string', format: 'date-time'}
            }
          }
        },
        pagination: {
          type: 'object',
          properties: {
            page: {type: 'number'},
            limit: {type: 'number'},
            total: {type: 'number'},
            pages: {type: 'number'}
          }
        }
      }
    }
  })
  async getOtpRecords(
    @Headers('x-api-key') apiKey: string,
    @Headers('x-project-id') projectId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('channel') channel?: OtpChannel,
    @Query('verified') verified?: boolean
  ) {
    if (!apiKey) {
      throw new BadRequestException('API key is required');
    }
    
    if (!projectId) {
      throw new BadRequestException('Project ID is required');
    }

    // Validate API key and project ownership
    await this.apiKeyService.validateApiKeyAndProject(apiKey, projectId);

    const filters: any = {};
    if (channel) filters.channel = channel;
    if (typeof verified === 'boolean') filters.verified = verified;

    return this.otpService.getOTPRecords(projectId, page, limit, filters);
  }

  @Get('stats')
  @ApiKey()
  @ApiOperation({
    summary: 'Get OTP statistics',
    description: 'Get statistical information about OTP usage for a project'
  })
  @ApiHeader({
    name: 'x-api-key',
    description: 'API Key for authentication',
    required: true
  })
  @ApiHeader({
    name: 'x-project-id',
    description: 'Project ID to get statistics for',
    required: true
  })
  @ApiQuery({name: 'dateFrom', required: false, type: String, description: 'Start date for statistics (ISO string)'})
  @ApiQuery({name: 'dateTo', required: false, type: String, description: 'End date for statistics (ISO string)'})
  @ApiResponse({
    status: 200,
    description: 'OTP statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        total: {type: 'number', example: 150},
        verified: {type: 'number', example: 120},
        unverified: {type: 'number', example: 30},
        verificationRate: {type: 'string', example: '80.00'},
        byChannel: {
          type: 'object',
          properties: {
            email: {type: 'number', example: 100},
            whatsapp: {type: 'number', example: 50}
          }
        }
      }
    }
  })
  async getOtpStats(
    @Headers('x-api-key') apiKey: string,
    @Headers('x-project-id') projectId: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string
  ) {
    if (!apiKey) {
      throw new BadRequestException('API key is required');
    }
    
    if (!projectId) {
      throw new BadRequestException('Project ID is required');
    }

    // Validate API key and project ownership
    await this.apiKeyService.validateApiKeyAndProject(apiKey, projectId);

    const filters: any = {};
    if (dateFrom) filters.dateFrom = new Date(dateFrom);
    if (dateTo) filters.dateTo = new Date(dateTo);

    return this.otpService.getOTPStats(projectId, filters.dateFrom, filters.dateTo);
  }

  @Get('token-info')
  @ApiKey()
  @ApiOperation({
    summary: 'Get token information',
    description: 'Get current token usage information for a specific project'
  })
  @ApiHeader({
    name: 'x-api-key',
    description: 'API Key for authentication',
    required: true
  })
  @ApiHeader({
    name: 'x-project-id',
    description: 'Project ID to get token info for',
    required: true
  })
  @ApiResponse({
    status: 200,
    description: 'Token information retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        tokens: {type: 'number', example: 100},
        tokensUsed: {type: 'number', example: 25},
        remainingTokens: {type: 'number', example: 75},
        hasUnlimitedTokens: {type: 'boolean', example: false}
      }
    }
  })
  @ApiResponse({status: 401, description: 'Unauthorized - Invalid API key or project'})
  async getTokenInfo(
    @Headers('x-api-key') apiKey: string,
    @Headers('x-project-id') projectId: string
  ) {
    if (!apiKey) {
      throw new BadRequestException('API key is required');
    }
    
    if (!projectId) {
      throw new BadRequestException('Project ID is required');
    }

    // Validate API key and project ownership
    await this.apiKeyService.validateApiKeyAndProject(apiKey, projectId);

    return this.apiKeyService.getTokenInfo(projectId);
  }
}
