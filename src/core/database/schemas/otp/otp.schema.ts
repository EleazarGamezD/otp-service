import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class OTP extends Document {
  @Prop({ required: true }) code: string;
  @Prop({ required: true }) target: string;
  @Prop({ required: true }) channel: 'email' | 'whatsapp';
  @Prop({ default: false }) verified: boolean;
  @Prop({ required: true }) expiresAt: Date;
}
export const OTPSchema = SchemaFactory.createForClass(OTP);
