import { Schema as MongooseSchema } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Voting, VotingSchema } from './voting.schema';
import { ModelName } from '../../common/enum/modelName.enum';

@Schema()
export class FleaMarketItemVoting extends Voting {
  @Prop({ type: MongooseSchema.Types.ObjectId, required: true })
  fleaMarketItem_id: string;
}

export const FleaMarketItemVotingSchema =
  SchemaFactory.createForClass(FleaMarketItemVoting);
FleaMarketItemVotingSchema.remove('type');

VotingSchema.virtual(ModelName.FLEA_MARKET_ITEM, {
  ref: ModelName.FLEA_MARKET_ITEM,
  localField: 'fleaMarketItem_id',
  foreignField: '_id',
  justOne: true,
});
