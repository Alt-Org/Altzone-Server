import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ExtractField } from '../common/decorator/response/ExtractField';
export type FeedbackDocument = HydratedDocument<Feedback>;

@Schema({ toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class Feedback {
  @Prop({ type: String, required: true })
  profile_id: string;

  @Prop({ type: String, required: true })
  text: string;

  @Prop({ type: Date })
  capturedAt?: Date;

  @ExtractField()
  _id: string;
}

export const FeedbackSchema = SchemaFactory.createForClass(Feedback);
