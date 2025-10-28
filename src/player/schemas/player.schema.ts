import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ModelName } from '../../common/enum/modelName.enum';
import { ExtractField } from '../../common/decorator/response/ExtractField';
import { GameStatistics } from '../gameStatistics.schema';
import { ObjectId } from 'mongodb';
import { Avatar, AvatarSchema } from './avatar.schema';

export type PlayerDocument = HydratedDocument<Player>;

@Schema({
  toJSON: { virtuals: true, getters: true },
  toObject: { virtuals: true, getters: true },
  timestamps: true,
})
export class Player {
  @Prop({ type: String, required: true, unique: true })
  name: string;

  @Prop({ type: Number, required: true })
  backpackCapacity: number;

  @Prop({ type: Number, default: 0, min: 0 })
  points: number;

  @Prop({ type: Number, default: 0, min: 0 })
  battlePoints: number;

  @Prop({ type: String, required: true, unique: true })
  uniqueIdentifier: string;

  @Prop({ type: Boolean, default: null })
  above13?: boolean;

  @Prop({ type: Boolean, default: null })
  parentalAuth?: boolean;

  @Prop({ type: Number, default: null })
  currentAvatarId?: number;

  @Prop({ type: GameStatistics, default: () => ({}) })
  gameStatistics?: GameStatistics;

  @ExtractField()
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: ModelName.PROFILE })
  profile_id?: string;

  @ExtractField()
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: ModelName.CLAN })
  clan_id?: string;

  @ExtractField()
  @Prop({ type: [ObjectId], default: [] })
  battleCharacter_ids?: string[] | ObjectId[];

  @Prop({ type: AvatarSchema, default: null })
  avatar?: Avatar;

  @Prop({ type: ObjectId, default: null })
  clanRole_id: string | ObjectId | null;

  @ExtractField()
  _id: string;
}

export const PlayerSchema = SchemaFactory.createForClass(Player);
PlayerSchema.set('collection', ModelName.PLAYER);
PlayerSchema.virtual(ModelName.CLAN, {
  ref: ModelName.CLAN,
  localField: 'clan_id',
  foreignField: '_id',
  justOne: true,
});
PlayerSchema.virtual(ModelName.CUSTOM_CHARACTER, {
  ref: ModelName.CUSTOM_CHARACTER,
  localField: '_id',
  foreignField: 'player_id',
});
PlayerSchema.virtual(ModelName.ROOM, {
  ref: ModelName.ROOM,
  localField: '_id',
  foreignField: 'player_id',
});
PlayerSchema.virtual(ModelName.DAILY_TASK, {
  ref: ModelName.DAILY_TASK,
  localField: '_id',
  foreignField: 'player_id',
  justOne: true,
});
PlayerSchema.index({ points: -1 });
PlayerSchema.index({ battlePoints: -1 });

export const publicReferences = [
  ModelName.CLAN,
  ModelName.CUSTOM_CHARACTER,
  ModelName.ROOM,
  ModelName.DAILY_TASK,
];
