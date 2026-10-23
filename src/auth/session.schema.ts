import { HydratedDocument, Types, Schema as MongooseSchema } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ExtractField } from '../common/decorator/response/ExtractField';
import { ModelName } from '../common/enum/modelName.enum';

export type SessionDocument = HydratedDocument<Session>;

@Schema({ 
  toJSON: { virtuals: true }, 
  toObject: { virtuals: true }, 
  timestamps: true,
})
export class Session {
  @Prop({ type: String, required: true })
  session_id: string;
  
  @Prop({ 
    type: MongooseSchema.Types.ObjectId, 
    ref: ModelName.PROFILE, 
    required: true,
  })
  profile_id: Types.ObjectId;
  
  @Prop({ type: String, required: true })
  tokenHash: string;

  @Prop({ type: Date, default: null })
  revokedAt: Date | null;

  @Prop({ type: Date, required: true })
  expiresAt: Date;

  @ExtractField()
  _id: string;
}

export const SessionSchema = SchemaFactory.createForClass(Session);
SessionSchema.set('collection', ModelName.SESSION);
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
SessionSchema.index({ session_id: 1, revokedAt: 1, profile_id: 1 });
