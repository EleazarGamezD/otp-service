import {OtpChannel} from '@app/core/enums/otp/channel.enum';
import {RequestWithClient} from '@app/core/interfaces/auth/auth.interface';
import {IOtpGenerateRequest} from '@app/core/interfaces/otp/otp.interface';
import {ApiKey} from '@auth/decorator/api-key.decorator';
import {ApiKeyGuard} from '@auth/guard/api-key.guard';
import {Body, Controller, Get, Post, Req, UseGuards} from '@nestjs/common';
import {ApiBody, ApiOperation, ApiResponse, ApiSecurity, ApiTags} from '@nestjs/swagger';
import {OtpService} from '@otp/service/otp.service';

@ApiTags('OTP')
@ApiSecurity('api-key')
@Controller('otp')
@UseGuards(ApiKeyGuard)
export class OtpController {
  constructor(private readonly otpService: OtpService) { }

  @Post('send')
  @ApiKey()
  @ApiOperation({
    summary: 'Send OTP',
    description: 'Generate and send a One-Time Password via email or WhatsApp'
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
        message: {type: 'string', example: 'OTP encolado'},
        expiresIn: {type: 'number', example: 45}
      }
    }
  })
  @ApiResponse({status: 400, description: 'Bad request - Invalid input'})
  @ApiResponse({status: 401, description: 'Unauthorized - Invalid API key'})
  @ApiResponse({status: 429, description: 'Too many requests - Rate limit exceeded'})
  async sendOtp(@Body() dto: IOtpGenerateRequest, @Req() req: RequestWithClient) {
    return this.otpService.generateOTP(dto.target, dto.channel, req.client!.apiKey);
  }

  @Post('verify')
  @ApiKey()
  @ApiOperation({
    summary: 'Verify OTP',
    description: 'Verify a One-Time Password code'
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
        reason: {type: 'string', example: 'Valid code'}
      }
    }
  })
  @ApiResponse({status: 400, description: 'Bad request - Invalid input'})
  @ApiResponse({status: 401, description: 'Unauthorized - Invalid API key'})
  async verifyOtp(@Body() dto: {target: string; code: string}, @Req() req: RequestWithClient) {
    return this.otpService.verifyOTP(dto.target, dto.code, req.client?.apiKey);
  }

  @Get('token-info')
  @ApiKey()
  @ApiOperation({
    summary: 'Get token information',
    description: 'Get current token usage information for the client'
  })
  @ApiResponse({
    status: 200,
    description: 'Token information retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        tokens: {type: 'number', example: 100},
        tokensUsed: {type: 'number', example: 25},
        remainingTokens: {type: 'number', example: 75}
      }
    }
  })
  @ApiResponse({status: 401, description: 'Unauthorized - Invalid API key'})
  async getTokenInfo(@Req() req: RequestWithClient) {
    return this.otpService.getClientTokenInfo(req.client!.apiKey);
  }
}
