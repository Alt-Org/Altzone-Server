import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { ModelName } from '../common/enum/modelName.enum';
import { Player } from '../player/player.schema';

export type GameDataDocument = HydratedDocument<Game>;

@Schema({ toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class Game {
  @Prop({ type: String, required: true, unique: true })
  gameId: string;

  @Prop({ type: [MongooseSchema.Types.ObjectId], required: true, ref: ModelName.PLAYER })
  team1: Player[];

  @Prop({ type: [MongooseSchema.Types.ObjectId], required: true, ref: ModelName.PLAYER })
  team2: Player[];

  @Prop({ type: MongooseSchema.Types.ObjectId, required: true, ref: ModelName.CLAN })
  team1Clan: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, required: true, ref: ModelName.CLAN })
  team2Clan: string;

  @Prop({ type: String, enum: ['team1', 'team2'], required: true })
  winner: string;

  @Prop ({ type: Date, required: true })
  startedAt: Date;

  @Prop ({ type: Date, required: true })
  endedAt: Date;
}

export const GameDataSchema = SchemaFactory.createForClass(Game);
GameDataSchema.set('collection', ModelName.GAME);
GameDataSchema.virtual(ModelName.PLAYER + '1', {
  ref: ModelName.PLAYER,
  localField: 'team1',
  foreignField: '_id',
});
GameDataSchema.virtual(ModelName.PLAYER + '2', {
  ref: ModelName.PLAYER,
  localField: 'team2',
  foreignField: '_id',
});
GameDataSchema.virtual(ModelName.CLAN + '1', {
  ref: ModelName.CLAN,
  localField: 'team1Clan',
  foreignField: '_id',
});
GameDataSchema.virtual(ModelName.CLAN + '2', {
  ref: ModelName.CLAN,
  localField: 'team2Clan',
  foreignField: '_id',
});