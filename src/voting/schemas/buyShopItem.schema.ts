import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ItemName } from '../../clanInventory/item/enum/itemName.enum';
import { Organizer } from './organizer.schema';
import { VotingType } from '../enum/VotingType.enum';
import { Vote } from './vote.schema';

@Schema()
export class BuyClanShopItemVoting {
  organizer: Organizer;
  endsOn: Date;
  type: VotingType;
  minPercentage: number;
  votes: Vote[];

  @Prop({ type: String, enum: ItemName })
  shopItemName: ItemName;
}

export const BuyClanShopItemVotingSchema = SchemaFactory.createForClass(
  BuyClanShopItemVoting,
);
