import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ItemName } from '../../clanInventory/item/enum/itemName.enum';

import { Voting } from './voting.schema';

@Schema()
export class BuyClanShopItemVoting extends Voting {
  @Prop({ type: String, enum: ItemName })
  shopItemName: ItemName;
}

export const BuyClanShopItemVotingSchema = SchemaFactory.createForClass(
  BuyClanShopItemVoting,
);
BuyClanShopItemVotingSchema.remove('type');
