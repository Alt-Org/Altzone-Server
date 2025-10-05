import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

@Schema({
  timestamps: { updatedAt: false },
  toJSON: { virtuals: true, getters: true },
  toObject: { virtuals: true, getters: true },
})
export class RequestLog {
  @Prop() method: string;
  @Prop() url: string;
  @Prop({ type: mongoose.Schema.Types.Mixed }) body: any;
  @Prop() statusCode: number;
  @Prop() type: string; // 'http' or 'ws'
  @Prop() responseTime: number;
  @Prop() client: string;
  @Prop({ type: mongoose.Schema.Types.Mixed }) data: any;
  @Prop({ type: mongoose.Schema.Types.Mixed }) error: any;
}

export const RequestLogSchema = SchemaFactory.createForClass(RequestLog);
