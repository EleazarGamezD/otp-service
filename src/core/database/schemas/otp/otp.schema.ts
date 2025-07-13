import {OtpChannel} from '@app/core/enums/otp/channel.enum';
import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Document, Types} from 'mongoose';

@Schema({timestamps: true})
export class OTP extends Document {
  @Prop({required: true})
  code: string;

  @Prop({required: true})
  target: string; // Email or phone number

  @Prop({required: true, enum: Object.values(OtpChannel)})
  channel: OtpChannel;

  @Prop({default: false})
  verified: boolean;

  @Prop({required: true})
  expiresAt: Date;

  @Prop({type: Types.ObjectId, ref: 'Client', required: true})
  clientId: Types.ObjectId;

  @Prop({required: true, index: true})
  projectId: string; // Public project ID (e.g: PRJ_abc123def456)

  @Prop({type: Types.ObjectId, ref: 'Project', required: true})
  projectObjectId: Types.ObjectId; // Internal reference to project document

  @Prop()
  recordId: string; // Unique ID for tracking this specific OTP

  @Prop()
  countryCode?: string; // Only for WhatsApp
}

export const OTPSchema = SchemaFactory.createForClass(OTP);

// Indexes to optimize queries
OTPSchema.index({projectId: 1, target: 1, channel: 1});
OTPSchema.index({recordId: 1});
OTPSchema.index({expiresAt: 1}, {expireAfterSeconds: 0}); // TTL index
