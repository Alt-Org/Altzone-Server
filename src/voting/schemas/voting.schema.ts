import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema } from 'mongoose';
import { ModelName } from '../../common/enum/modelName.enum';
import { VotingType } from '../enum/VotingType.enum';
import { Vote, VoteSchema } from './vote.schema';
import { Organizer } from './organizer.schema';
import { ItemName } from '../../clanInventory/item/enum/itemName.enum';
import { SetClanRole } from './setClanRole.schema';

export type VotingDocument = HydratedDocument<Voting>;

@Schema({ toJSON: { virtuals: true }, toObject: { virtuals: true } })
export class Voting {
  @Prop({ type: Organizer, required: true })
  organizer: Organizer;

  @Prop({
    type: Date,
    default: () => new Date(Date.now() + 10 * 60 * 1000), // 10 minutes from current time
  })
  endsOn: Date;

  @Prop({ type: String, enum: VotingType, required: true })
  type: VotingType;

  @Prop({ type: Number, default: 51 })
  minPercentage: number;

  @Prop({ type: [VoteSchema], default: [] })
  votes: Vote[];

  @Prop({ type: MongooseSchema.Types.ObjectId })
  fleaMarketItem_id?: string;

  @Prop({ type: String, enum: ItemName })
  shopItem?: ItemName;

  @Prop({ type: SetClanRole })
  setClanRole?: SetClanRole;
}

export const VotingSchema = SchemaFactory.createForClass(Voting);
VotingSchema.set('collection', ModelName.VOTING);
VotingSchema.virtual(ModelName.PLAYER, {
  ref: ModelName.PLAYER,
  localField: 'organizer.player_id',
  foreignField: '_id',
  justOne: true,
});

VotingSchema.virtual(ModelName.CLAN, {
  ref: ModelName.CLAN,
  localField: 'organizer.clan_id',
  foreignField: '_id',
  justOne: true,
});

VotingSchema.virtual(ModelName.FLEA_MARKET_ITEM, {
  ref: ModelName.FLEA_MARKET_ITEM,
  localField: 'entity_id',
  foreignField: '_id',
  justOne: true,
});

VoteSchema.virtual(ModelName.PLAYER, {
  ref: ModelName.PLAYER,
  localField: 'setClanRole.player_id',
  foreignField: '_id',
  justOne: true,
});
