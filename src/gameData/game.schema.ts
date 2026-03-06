import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { ModelName } from '../common/enum/modelName.enum';
import { ExtractField } from '../common/decorator/response/ExtractField';
import { BattleStatus } from './enum/battleStatus.enum';

export type GameDocument = HydratedDocument<Game>;

@Schema({ toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class Game {
  @Prop({
    type: [MongooseSchema.Types.ObjectId],
    required: true,
    ref: ModelName.PLAYER,
  })
  team1: string[];

  @Prop({
    type: [MongooseSchema.Types.ObjectId],
    required: true,
    ref: ModelName.PLAYER,
  })
  team2: string[];

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    required: false, // not required anymore due to a business logic change
    ref: ModelName.CLAN,
  })
  team1Clan?: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    required: false, // not required anymore due to a business logic change
    ref: ModelName.CLAN,
  })
  team2Clan?: string;

  @Prop({ type: String, required: true, default: 'REGULAR' })
  gameType: string;

  @Prop({ type: String, enum: BattleStatus, default: BattleStatus.OPEN })
  status: BattleStatus;

  @Prop({
    type: [{
      playerId: { type: MongooseSchema.Types.ObjectId, ref: ModelName.PLAYER },
      winnerTeam: Number,
      duration: Number,
      receivedAt: { type: Date, default: Date.now }
    }],
    default: []
  })
  receivedResults: {
    playerId: string;
    winnerTeam: number;
    duration: number;
    receivedAt?: Date;
  }[];

  @Prop({ type: Number })
  finalWinner: number;

  @Prop({ type: Number, enum: [1, 2] })
  winner?: number;

  @Prop({ type: Date })
  startedAt?: Date;

  @Prop({ type: Date })
  endedAt?: Date;

  @ExtractField()
  _id: string;
}

export const GameSchema = SchemaFactory.createForClass(Game);

// Making sure players can't be on both teams at the same time
GameSchema.pre('validate', function (next) {
  const t1 = (this.team1 || []).map(id => id.toString());
  const t2 = (this.team2 || []).map(id => id.toString());
  
  const intersection = t1.filter(id => t2.includes(id));
  if (intersection.length > 0) {
    return next(new Error(`Player ${intersection[0]} cannot be on both teams at the same time`));
  }
  next();
});

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
