import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { ModelName } from '../common/enum/modelName.enum';
import { ExtractField } from '../common/decorator/response/ExtractField';

export type GameDocument = HydratedDocument<Game>;

@Schema({ toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class Game {
  @Prop({ type: [MongooseSchema.Types.ObjectId], required: true, ref: ModelName.PLAYER })
  team1: string[];

  @Prop({ type: [MongooseSchema.Types.ObjectId], required: true, ref: ModelName.PLAYER })
  team2: string[];

  @Prop({ type: MongooseSchema.Types.ObjectId, required: true, ref: ModelName.CLAN })
  team1Clan: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, required: true, ref: ModelName.CLAN })
  team2Clan: string;

  @Prop({ type: Number, enum: [1, 2], required: true })
  winner: number;

  @Prop ({ type: Date, required: true })
  startedAt: Date;

  @Prop ({ type: Date, required: true })
  endedAt: Date;

  @ExtractField()
  _id: string;
}

export const GameSchema = SchemaFactory.createForClass(Game);
GameSchema.set('collection', ModelName.GAME);
GameSchema.virtual(ModelName.PLAYER + '1', {
  ref: ModelName.PLAYER,
  localField: 'team1',
  foreignField: '_id',
});
GameSchema.virtual(ModelName.PLAYER + '2', {
  ref: ModelName.PLAYER,
  localField: 'team2',
  foreignField: '_id',
});
GameSchema.virtual(ModelName.CLAN + '1', {
  ref: ModelName.CLAN,
  localField: 'team1Clan',
  foreignField: '_id',
});
GameSchema.virtual(ModelName.CLAN + '2', {
  ref: ModelName.CLAN,
  localField: 'team2Clan',
  foreignField: '_id',
});