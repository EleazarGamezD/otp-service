import {Injectable, Logger} from '@nestjs/common';
import * as fs from 'fs';
import * as Handlebars from 'handlebars';
import * as path from 'path';

export interface OtpEmailTemplateData {
  projectName: string;
  otpCode: string;
  expirationTime: string;
  customMessage?: string;
  logoUrl?: string;
  footerText?: string;
  contactInfo?: string;
}

@Injectable()
export class TemplateService {
  private readonly logger = new Logger(TemplateService.name);
  private emailTemplate: HandlebarsTemplateDelegate;

  constructor() {
    this.loadTemplates();
  }

  /**
   * Load and compile Handlebars templates
   */
  private loadTemplates() {
    try {
      // Try to load from dist first (production), then fallback to src (development)
      const distPath = path.join(__dirname, '..', 'template', 'otp-email.hbs');
      const srcPath = path.join(process.cwd(), 'src', 'modules', 'mail', 'template', 'otp-email.hbs');

      let templatePath: string;
      let templateSource: string;

      try {
        // Try dist path first
        templateSource = fs.readFileSync(distPath, 'utf8');
        templatePath = distPath;
        this.logger.debug(`Template loaded from dist: ${templatePath}`);
      } catch {
        // Fallback to src path for development
        templateSource = fs.readFileSync(srcPath, 'utf8');
        templatePath = srcPath;
        this.logger.debug(`Template loaded from src: ${templatePath}`);
      }

      this.emailTemplate = Handlebars.compile(templateSource);
      this.logger.log('Email templates loaded successfully');
    } catch (error) {
      this.logger.error('Failed to load email templates:', error);
      this.logger.error(`Available paths checked: dist and src directories`);
      throw new Error('Template loading failed');
    }
  }

  /**
   * Render the OTP email template with provided data
   */
  renderOtpEmail(data: OtpEmailTemplateData): string {
    try {
      // Format the OTP code with dashes for better readability
      const formattedOtpCode = data.otpCode.replace(/(.{1})/g, '$1 - ').slice(0, -3);

      const templateData = {
        ...data,
        otpCode: formattedOtpCode,
        // Default values if not provided
        projectName: data.projectName || 'OTP Service',
        expirationTime: data.expirationTime || '5 minutes',
      };

      const html = this.emailTemplate(templateData);

      this.logger.debug(`Email template rendered successfully for project: ${data.projectName}`);
      return html;
    } catch (error) {
      this.logger.error('Failed to render email template:', error);
      throw new Error('Template rendering failed');
    }
  }

  /**
   * Get the template data structure for documentation purposes
   */
  getTemplateDataStructure(): object {
    return {
      projectName: 'string (required) - Name of the project',
      otpCode: 'string (required) - The OTP code to display',
      expirationTime: 'string (required) - When the code expires (e.g., "5 minutes")',
      customMessage: 'string (optional) - Custom message to display instead of default',
      logoUrl: 'string (optional) - URL to project logo image',
      footerText: 'string (optional) - Custom footer text',
      contactInfo: 'string (optional) - Contact information for support'
    };
  }
}
