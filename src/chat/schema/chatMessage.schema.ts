import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';
import { HydratedDocument } from 'mongoose';
import { ChatType } from '../enum/chatMessageType.enum';
import { ModelName } from '../../common/enum/modelName.enum';
import { Reaction } from './reaction.schema';
import { Feeling } from '../enum/feeling.enum';

export type ChatMessageDocument = HydratedDocument<ChatMessage>;

@Schema({
  timestamps: true,
  toJSON: { virtuals: true, getters: true },
  toObject: { virtuals: true, getters: true },
})
export class ChatMessage {
  @Prop({ type: String, enum: ChatType, required: true })
  type: ChatType;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: ModelName.PLAYER,
    required: true,
  })
  sender_id: MongooseSchema.Types.ObjectId;

  @Prop({ type: String, enum: Feeling })
  feeling?: Feeling;

  @Prop({ type: String, required: true })
  content: string;

  @Prop({ type: String })
  recipient_id?: string;

  @Prop({ type: String })
  clan_id?: string;

  @Prop({ type: [Reaction], default: [] })
  reactions: Reaction[];
}

export const ChatMessageSchema = SchemaFactory.createForClass(ChatMessage);

ChatMessageSchema.index({ clan_id: 1, createdAt: -1 });

ChatMessageSchema.virtual('sender', {
  ref: ModelName.PLAYER,
  localField: 'sender_id',
  foreignField: '_id',
  justOne: true,
});
