import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Document, Types} from 'mongoose';

export interface IEmailTemplate {
    subject: string;
    body: string; // HTML template with {{code}} placeholder
}

export interface IWhatsAppTemplate {
    message: string; // Text template with {{code}} placeholder
}

@Schema({timestamps: true})
export class Project extends Document {
    @Prop({required: true, unique: true, index: true})
    projectId: string; // Public project ID (e.g: PRJ_abc123def456)

    @Prop({required: true, type: Types.ObjectId, ref: 'Client', index: true})
    clientId: Types.ObjectId; // Reference to the owner client

    @Prop({required: true, trim: true})
    name: string; // Project name

    @Prop({trim: true})
    description?: string; // Optional project description

    @Prop({required: true, default: true})
    isActive: boolean;

    @Prop({required: true, default: false})
    hasUnlimitedTokens: boolean; // Para proyectos especiales que no consumen tokens

    @Prop({required: true, default: false})
    isProduction: boolean; // Solo los admin pueden cambiar esto

    @Prop({required: true, default: 20, min: 0})
    tokens: number; // Tokens disponibles para este proyecto

    @Prop({required: true, default: 0, min: 0})
    tokensUsed: number; // Tokens consumidos por este proyecto

    @Prop({default: 5, min: 1, max: 100})
    rateLimitPerMinute: number;

    // OTP expiration configuration in seconds
    @Prop({default: 300, min: 60, max: 3600}) // Default 5 minutes, min 1 minute, max 1 hour
    otpExpirationSeconds: number;

    // Email template configuration
    @Prop({
        type: {
            subject: {type: String, required: true},
            body: {type: String, required: true}
        },
        default: {
            subject: 'Tu código de verificación',
            body: '<h2>Código de verificación</h2><p>Tu código es: <strong>{{code}}</strong></p><p>Este código expira en {{expirationMinutes}} minutos.</p>'
        }
    })
    emailTemplate: IEmailTemplate;

    // WhatsApp template configuration
    @Prop({
        type: {
            message: {type: String, required: true}
        },
        default: {
            message: 'Tu código de verificación es: {{code}}. Este código expira en {{expirationMinutes}} minutos.'
        }
    })
    whatsappTemplate: IWhatsAppTemplate;

    @Prop({default: Date.now})
    createdAt: Date;

    @Prop({default: Date.now})
    updatedAt: Date;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);

// Índices compuestos para optimizar consultas
ProjectSchema.index({clientId: 1, isActive: 1});
ProjectSchema.index({projectId: 1, isActive: 1});
