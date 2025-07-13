import {IConfiguration} from '@app/core/interfaces/configuration/configuration.interface';
import {IEmailTemplate} from '@app/core/interfaces/projects/project.interface';
import {Injectable, Logger} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {Resend} from 'resend';
import {OtpEmailTemplateData, TemplateService} from '../template.service';

export interface SendOtpEmailOptions {
    to: string;
    code: string;
    projectName: string;
    expirationMinutes?: number;
    customMessage?: string;
    logoUrl?: string;
    footerText?: string;
    contactInfo?: string;
    useCustomTemplate?: boolean;
    customTemplate?: IEmailTemplate;
}

@Injectable()
export class MailService {
    private readonly logger = new Logger(MailService.name);
    private resend: Resend;

    constructor(
        private configService: ConfigService,
        private templateService: TemplateService
    ) {
        const mailConfig = this.configService.get<IConfiguration['mailKeys']>('mailKeys');

        if (!mailConfig?.resendApiKey) {
            this.logger.warn('Resend API key not found. Email service will not work properly.');
            return;
        }

        this.resend = new Resend(mailConfig.resendApiKey);
        this.logger.log('Resend email service initialized successfully');
    }

    /**
     * Send OTP email using the new template system (recommended)
     */
    async sendOTPEmailWithTemplate(options: SendOtpEmailOptions) {
        try {
            const mailConfig = this.configService.get<IConfiguration['mailKeys']>('mailKeys');

            if (!this.resend) {
                throw new Error('Resend is not initialized. Check your API key configuration.');
            }

            const {
                to,
                code,
                projectName,
                expirationMinutes = 5,
                customMessage,
                logoUrl,
                footerText,
                contactInfo,
                useCustomTemplate = false,
                customTemplate
            } = options;

            let htmlContent: string;
            let subject: string;

            if (useCustomTemplate && customTemplate) {
                // Use the old template system for backward compatibility
                subject = customTemplate.subject.replace(/\{\{code\}\}/g, code);
                htmlContent = customTemplate.body
                    .replace(/\{\{code\}\}/g, code)
                    .replace(/\{\{expirationMinutes\}\}/g, expirationMinutes.toString());
            } else {
                // Use the new Handlebars template system
                const expirationTime = expirationMinutes === 1
                    ? '1 minute'
                    : `${expirationMinutes} minutes`;

                const templateData: OtpEmailTemplateData = {
                    projectName,
                    otpCode: code,
                    expirationTime,
                    customMessage,
                    logoUrl,
                    footerText,
                    contactInfo
                };

                htmlContent = this.templateService.renderOtpEmail(templateData);
                subject = `${projectName} - Your OTP Code`;
            }

            this.logger.log(`Sending OTP email to ${to} via Resend for project: ${projectName}`);
            this.logger.debug(`Subject: ${subject}`);
            this.logger.debug(`OTP expires in ${expirationMinutes} minutes`);

            const result = await this.resend.emails.send({
                from: mailConfig?.from || 'noreply@eleazargamez.dev',
                to: [to],
                subject: subject,
                html: htmlContent,
            });

            this.logger.log(`Email sent successfully to ${to}. Message ID: ${result.data?.id}`);
            return result;

        } catch (error) {
            this.logger.error(`Failed to send OTP email to ${to}:`, {
                error: error.message,
                name: error.name,
                statusCode: error.statusCode || 'unknown',
                details: error
            });
            throw new Error(`Email sending failed: ${error.message || 'Unknown error'}`);
        }
    }

    /**
     * Legacy method - backward compatibility
     */
    async sendOTPEmail(to: string, code: string, template?: IEmailTemplate, expirationMinutes?: number) {
        try {
            const mailConfig = this.configService.get<IConfiguration['mailKeys']>('mailKeys');

            if (!this.resend) {
                throw new Error('Resend is not initialized. Check your API key configuration.');
            }

            // Use custom template if provided, otherwise use default
            const emailTemplate = template || {
                subject: 'Your verification code',
                body: '<h2>Verification Code</h2><p>Your code is: <strong>{{code}}</strong></p><p>This code expires in {{expirationMinutes}} minutes.</p>'
            };

            // Replace template placeholders
            const subject = emailTemplate.subject.replace(/\{\{code\}\}/g, code);
            let body = emailTemplate.body.replace(/\{\{code\}\}/g, code);

            // Replace expiration minutes placeholder
            if (expirationMinutes !== undefined) {
                body = body.replace(/\{\{expirationMinutes\}\}/g, expirationMinutes.toString());
            }

            this.logger.log(`Sending OTP email to ${to} via Resend (legacy mode)`);
            this.logger.debug(`Subject: ${subject}`);
            this.logger.debug(`OTP expires in ${expirationMinutes || 'default'} minutes`);

            const result = await this.resend.emails.send({
                from: mailConfig?.from || 'noreply@eleazargamez.dev',
                to: [to],
                subject: subject,
                html: body,
            });

            this.logger.log(`Email sent successfully to ${to}. Message ID: ${result.data?.id}`);
            return result;

        } catch (error) {
            this.logger.error(`Failed to send OTP email to ${to}:`, {
                error: error.message,
                name: error.name,
                statusCode: error.statusCode || 'unknown',
                details: error
            });
            throw new Error(`Email sending failed: ${error.message || 'Unknown error'}`);
        }
    }

    /**
     * Test email sending - useful for debugging
     */
    async sendTestEmail(to: string): Promise<any> {
        try {
            const mailConfig = this.configService.get<IConfiguration['mailKeys']>('mailKeys');

            if (!this.resend) {
                throw new Error('Resend is not initialized. Check your API key configuration.');
            }

            this.logger.log(`Sending test email to ${to} via Resend`);

            const result = await this.resend.emails.send({
                from: mailConfig?.from as string,
                to: [to],
                subject: 'Configuration Test - OTP Service',
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">✅ Email Configuration Successful</h2>
            <p>This is a test email from your OTP service.</p>
            <p><strong>Service:</strong> Resend</p>
            <p><strong>Domain:</strong> eleazargamez.dev</p>
            <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
            <p style="color: #666; font-size: 12px;">If you receive this email, the configuration is working perfectly.</p>
          </div>
        `,
            });

            this.logger.log(`Test email sent successfully to ${to}. Message ID: ${result.data?.id}`);
            return result;

        } catch (error) {
            this.logger.error(`Failed to send test email to ${to}:`, {
                error: error.message,
                name: error.name,
                statusCode: error.statusCode || 'unknown',
                details: error
            });
            throw new Error(`Test email sending failed: ${error.message || 'Unknown error'}`);
        }
    }

    /**
     * Get template data structure for API documentation
     */
    getTemplateStructure(): object {
        return this.templateService.getTemplateDataStructure();
    }
}
