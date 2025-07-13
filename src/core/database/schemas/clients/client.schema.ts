import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Document} from 'mongoose';

@Schema({timestamps: true})
export class Client extends Document {
  @Prop({required: true, trim: true})
  companyName: string;

  @Prop({required: true, unique: true, lowercase: true, trim: true})
  email: string;

  @Prop({required: true})
  password: string;

  @Prop({required: true, enum: ['admin', 'customer'], default: 'customer'})
  role: string;

  @Prop({required: true, unique: true, index: true})
  apiKey: string;

  @Prop({required: true, default: true})
  isActive: boolean;

  @Prop({default: Date.now})
  createdAt: Date;

  @Prop({default: Date.now})
  updatedAt: Date;
}

export const ClientSchema = SchemaFactory.createForClass(Client);
