import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Client extends Document {
  @Prop({ required: true }) name: string;
  @Prop({ required: true, unique: true }) apiKey: string;
  @Prop({ default: 5 }) rateLimitPerMinute: number;
}
export const ClientSchema = SchemaFactory.createForClass(Client);
