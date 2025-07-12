import {OtpChannel} from '@app/core/enums/otp/channel.enum';
import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Document} from 'mongoose';

@Schema({timestamps: true})
export class OTP extends Document {
  @Prop({required: true}) code: string;
  @Prop({required: true}) target: string;
  @Prop({required: true, enum: Object.values(OtpChannel)}) channel: OtpChannel;
  @Prop({default: false}) verified: boolean;
  @Prop({required: true}) expiresAt: Date;
}
export const OTPSchema = SchemaFactory.createForClass(OTP);
