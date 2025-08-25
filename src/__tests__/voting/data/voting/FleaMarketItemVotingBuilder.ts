import { ObjectId } from 'mongodb';
import { VotingBuilder } from './VotingBuilder';
import { FleaMarketItemVoting } from '../../../../voting/schemas/fleamarketItemVoting.schema';

export class FleaMarketItemVotingBuilder extends VotingBuilder {
  private fleaMarketItem_id: string = new ObjectId().toString();
  private price = 0;

  override build() {
    return {
      ...this.base,
      fleaMarketItem_id: this.fleaMarketItem_id,
      price: this.price,
    } as FleaMarketItemVoting;
  }

  setFleaMarketItem_id(_id: string) {
    this.fleaMarketItem_id = _id;
    return this;
  }

  setPrice(price: number) {
    this.price = price;
    return this;
  }
}
