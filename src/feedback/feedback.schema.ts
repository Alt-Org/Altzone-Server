import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { ModelName } from '../common/enum/modelName.enum';
export type FeedbackDocument = HydratedDocument<Feedback>;

@Schema({ toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class Feedback {
  @Prop({ type: String, required: true })
  profile_id: string;

  @Prop({ type: String, required: true })
  text: string;

  @Prop({ type: Date })
  capturedAt?: Date;
}

export const FeedbackSchema =
  SchemaFactory.createForClass(Feedback);

export const publicReferences = [ModelName.FEEDBACK];
