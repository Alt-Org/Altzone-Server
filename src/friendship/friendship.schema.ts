import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  HydratedDocument,
  Schema as MongooseSchema,
  UpdateQuery,
} from 'mongoose';
import { ModelName } from '../common/enum/modelName.enum';
import { FriendshipStatus } from './enum/friendship-status.enum';

export type FriendshipDocument = HydratedDocument<Friendship>;

@Schema({ timestamps: true })
export class Friendship {
  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: ModelName.PLAYER,
    required: true,
  })
  playerA: MongooseSchema.Types.ObjectId;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: ModelName.PLAYER,
    required: true,
  })
  playerB: MongooseSchema.Types.ObjectId;

  @Prop({
    type: String,
    enum: FriendshipStatus,
    required: true,
    default: FriendshipStatus.PENDING,
  })
  status: FriendshipStatus;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: ModelName.PLAYER,
    required: function () {
      return this.status === FriendshipStatus.PENDING;
    },
  })
  requester?: MongooseSchema.Types.ObjectId;

  @Prop({ type: String, required: true })
  pairKey: string;
}

export const FriendshipSchema = SchemaFactory.createForClass(Friendship);

FriendshipSchema.set('collection', ModelName.FRIENDSHIP);
FriendshipSchema.index({ pairKey: 1 }, { unique: true });
FriendshipSchema.pre('validate', function (next) {
  const a = this.playerA.toString();
  const b = this.playerB.toString();
  this.pairKey = [a, b].sort().join('_');
  next();
});
FriendshipSchema.pre('save', function (next) {
  if (this.isModified('status') && this.status === FriendshipStatus.ACCEPTED) {
    this.requester = undefined;
  }
  next();
});
FriendshipSchema.pre('updateOne', function (next) {
  const update = this.getUpdate();

  if (update && !Array.isArray(update)) {
    const u = update as UpdateQuery<FriendshipDocument>;

    if (u.$set.status === FriendshipStatus.ACCEPTED) {
      u.$unset = u.$unset || {};
      u.$unset.requester = '';
    }
  }
  next();
});
