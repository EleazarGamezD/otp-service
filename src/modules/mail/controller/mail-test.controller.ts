import {Body, Controller, Logger, Post} from '@nestjs/common';
import {ApiBody, ApiOperation, ApiResponse, ApiTags} from '@nestjs/swagger';
import {AdminAuth} from '../../admin-auth/decorator/admin-auth.decorator';
import {MailService} from '../service/mail.service';

@ApiTags('Mail Testing')
@Controller('mail-test')
@AdminAuth()
export class MailTestController {
    private readonly logger = new Logger(MailTestController.name);

    constructor(private readonly mailService: MailService) { }

    @Post('send-test')
    @ApiOperation({
        summary: 'Send test email',
        description: 'Send a test email to verify Resend configuration'
    })
    @ApiBody({
        description: 'Test email request',
        schema: {
            type: 'object',
            required: ['to'],
            properties: {
                to: {
                    type: 'string',
                    format: 'email',
                    description: 'Email address to send test email to',
                    example: 'test@example.com'
                }
            }
        }
    })
    @ApiResponse({
        status: 200,
        description: 'Test email sent successfully',
        schema: {
            type: 'object',
            properties: {
                success: {type: 'boolean'},
                message: {type: 'string'},
                messageId: {type: 'string'}
            }
        }
    })
    @ApiResponse({status: 400, description: 'Invalid email address'})
    @ApiResponse({status: 500, description: 'Email service error'})
    async sendTestEmail(@Body() body: {to: string}) {
        try {
            const result = await this.mailService.sendTestEmail(body.to);

            return {
                success: true,
                message: 'Test email sent successfully',
                messageId: result.data?.id,
                provider: 'Resend'
            };
        } catch (error) {
            this.logger.error('Email test error:', error);

            return {
                success: false,
                message: error.message || 'Failed to send test email',
                error: error.name || 'Unknown error',
                statusCode: error.statusCode || 500,
                details: process.env.NODE_ENV === 'development' ? error : null
            };
        }
    }

    @Post('send-otp-test')
    @ApiOperation({
        summary: 'Send test OTP email',
        description: 'Send a test OTP email with custom template'
    })
    @ApiBody({
        description: 'Test OTP email request',
        schema: {
            type: 'object',
            required: ['to'],
            properties: {
                to: {
                    type: 'string',
                    format: 'email',
                    description: 'Email address to send test OTP to',
                    example: 'test@example.com'
                },
                expirationMinutes: {
                    type: 'number',
                    description: 'OTP expiration in minutes',
                    example: 5,
                    minimum: 1,
                    maximum: 60
                }
            }
        }
    })
    @ApiResponse({
        status: 200,
        description: 'Test OTP email sent successfully'
    })
    async sendTestOTP(@Body() body: {to: string; expirationMinutes?: number}) {
        try {
            const testCode = '123456';
            const expirationMinutes = body.expirationMinutes || 5;

            const customTemplate = {
                subject: '🔐 Código de Verificación - Prueba',
                body: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #2563eb; text-align: center;">Código de Verificación</h2>
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
              <h3 style="color: #1f2937; margin: 0;">Tu código es:</h3>
              <div style="font-size: 32px; font-weight: bold; color: #2563eb; margin: 10px 0; letter-spacing: 4px;">{{code}}</div>
            </div>
            <p style="color: #6b7280; text-align: center;">Este código expira en <strong>{{expirationMinutes}} minutos</strong>.</p>
            <p style="color: #9ca3af; font-size: 12px; text-align: center;">Este es un email de prueba desde OTP Service con Resend.</p>
          </div>
        `
            };

            const result = await this.mailService.sendOTPEmail(
                body.to,
                testCode,
                customTemplate,
                expirationMinutes
            );

            return {
                success: true,
                message: 'Test OTP email sent successfully',
                messageId: result.data?.id,
                code: testCode,
                expirationMinutes,
                provider: 'Resend'
            };
        } catch (error) {
            return {
                success: false,
                message: error.message || 'Failed to send test OTP email',
                error: error.name
            };
        }
    }

    @Post('send-otp-template-test')
    @ApiOperation({
        summary: 'Send OTP test email with new template system',
        description: 'Send an OTP test email using the new Handlebars template system'
    })
    @ApiBody({
        description: 'OTP template test email request',
        schema: {
            type: 'object',
            required: ['to', 'code', 'projectName'],
            properties: {
                to: {
                    type: 'string',
                    format: 'email',
                    description: 'Email address to send OTP to',
                    example: 'test@example.com'
                },
                code: {
                    type: 'string',
                    description: 'OTP code to send',
                    example: '123456'
                },
                projectName: {
                    type: 'string',
                    description: 'Name of the project',
                    example: 'My Awesome App'
                },
                expirationMinutes: {
                    type: 'number',
                    description: 'Code expiration time in minutes',
                    example: 5,
                    default: 5
                },
                customMessage: {
                    type: 'string',
                    description: 'Custom message to include in email (optional)',
                    example: 'Welcome to our platform! Please verify your email.'
                },
                logoUrl: {
                    type: 'string',
                    description: 'URL to project logo (optional)',
                    example: 'https://example.com/logo.png'
                },
                footerText: {
                    type: 'string',
                    description: 'Custom footer text (optional)',
                    example: 'Thank you for using our service!'
                },
                contactInfo: {
                    type: 'string',
                    description: 'Contact information for support (optional)',
                    example: 'support@example.com | +1 (555) 123-4567'
                }
            }
        }
    })
    @ApiResponse({
        status: 200,
        description: 'OTP email sent successfully',
        schema: {
            type: 'object',
            properties: {
                success: {type: 'boolean'},
                message: {type: 'string'},
                messageId: {type: 'string'},
                templateData: {type: 'object'}
            }
        }
    })
    @ApiResponse({status: 400, description: 'Invalid request data'})
    @ApiResponse({status: 500, description: 'Email service error'})
    async sendOTPTemplateTestEmail(@Body() body: {
        to: string;
        code: string;
        projectName: string;
        expirationMinutes?: number;
        customMessage?: string;
        logoUrl?: string;
        footerText?: string;
        contactInfo?: string;
    }) {
        try {
            const result = await this.mailService.sendOTPEmailWithTemplate(body);

            return {
                success: true,
                message: 'OTP test email sent successfully with new template system',
                messageId: result.data?.id,
                templateData: {
                    projectName: body.projectName,
                    otpCode: body.code,
                    expirationTime: `${body.expirationMinutes || 5} minutes`,
                    customMessage: body.customMessage || null,
                    logoUrl: body.logoUrl || null,
                    footerText: body.footerText || null,
                    contactInfo: body.contactInfo || null
                }
            };
        } catch (error) {
            this.logger.error('Failed to send OTP template test email:', error);
            return {
                success: false,
                message: error.message || 'Failed to send OTP template test email',
                error: error.name
            };
        }
    }

    @Post('template-structure')
    @ApiOperation({
        summary: 'Get email template structure',
        description: 'Get the data structure required for the email template'
    })
    @ApiResponse({
        status: 200,
        description: 'Template structure retrieved successfully',
        schema: {
            type: 'object',
            properties: {
                templateStructure: {type: 'object'},
                example: {type: 'object'}
            }
        }
    })
    async getTemplateStructure() {
        const structure = this.mailService.getTemplateStructure();

        return {
            templateStructure: structure,
            example: {
                projectName: 'My Awesome App',
                otpCode: '123456',
                expirationTime: '5 minutes',
                customMessage: 'Welcome to our platform! Please verify your email with the code above.',
                logoUrl: 'https://example.com/logo.png',
                footerText: 'Thank you for using our service!',
                contactInfo: 'support@example.com | +1 (555) 123-4567'
            }
        };
    }
}
