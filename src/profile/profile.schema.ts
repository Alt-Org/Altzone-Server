import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ModelName } from '../common/enum/modelName.enum';
import { Player } from '../player/schemas/player.schema';
import { Environment } from '../common/enum/environment.enum';

export type ProfileDocument = HydratedDocument<Profile>;

@Schema({
  toJSON: { virtuals: true, getters: true },
  toObject: { virtuals: true, getters: true },
})
export class Profile {
  @Prop({ type: String, required: true, unique: true })
  username: string;

  @Prop({ type: String, required: true })
  password: string;

  @Prop({ type: Boolean, default: false })
  isSystemAdmin: boolean;

  @Prop({ type: Boolean, default: false })
  isGuest: boolean;

  @Prop({ type: String })
  securityQuestion?: string;

  @Prop({ type: String })
  securityAnswer?: string;

  @Prop({ type: Number })
  failedRecoveryAttempts?: number;

  @Prop({ type: Date })
  recoveryLockedUntil?: Date;

  @Prop({ type: Number })
  tokenVersion?: number;

  @Prop({
    type: Number,
    default: Environment.TEACHING_DEMO,
    enum: [Environment.TEACHING_DEMO, Environment.OPEN_DEMO],
  })
  environment?: number;

  @Prop({ type: Date, expires: 60 * 60 })
  expireAt?: Date;

  Player?: Player;

  _id: string;
}

export const ProfileSchema = SchemaFactory.createForClass(Profile);
ProfileSchema.set('collection', ModelName.PROFILE);
ProfileSchema.virtual(ModelName.PLAYER, {
  ref: ModelName.PLAYER,
  localField: '_id',
  foreignField: 'profile_id',
  justOne: true,
});
