import {OtpChannel} from '@app/core/enums/otp/channel.enum';
import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Document, Types} from 'mongoose';

@Schema({timestamps: true})
export class OTP extends Document {
  @Prop({required: true})
  code: string;

  @Prop({required: true})
  target: string; // Email o número de teléfono

  @Prop({required: true, enum: Object.values(OtpChannel)})
  channel: OtpChannel;

  @Prop({default: false})
  verified: boolean;

  @Prop({required: true})
  expiresAt: Date;

  @Prop({type: Types.ObjectId, ref: 'Client', required: true})
  clientId: Types.ObjectId;

  @Prop({required: true, index: true})
  projectId: string; // ID público del proyecto (ej: PRJ_abc123def456)

  @Prop({type: Types.ObjectId, ref: 'Project', required: true})
  projectObjectId: Types.ObjectId; // Referencia interna al documento del proyecto

  @Prop()
  recordId: string; // ID único para rastreo de este OTP específico

  @Prop()
  countryCode?: string; // Solo para WhatsApp
}

export const OTPSchema = SchemaFactory.createForClass(OTP);

// Índices para optimizar consultas
OTPSchema.index({projectId: 1, target: 1, channel: 1});
OTPSchema.index({recordId: 1});
OTPSchema.index({expiresAt: 1}, {expireAfterSeconds: 0}); // TTL index
