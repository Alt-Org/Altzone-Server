import { ObjectId } from 'mongodb';
import { VotingBuilder } from './VotingBuilder';
import { FleaMarketItemVoting } from '../../../../voting/schemas/fleamarketItemVoting.schema';

export class FleaMarketItemVotingBuilder extends VotingBuilder {
  fleaMarketItem_id: string = new ObjectId().toString();

  setFleaMarketItem_id(_id: string) {
    this.fleaMarketItem_id = _id;
    return this;
  }

  override build() {
    return {
      ...this.base,
      fleaMarketItem_id: this.fleaMarketItem_id,
    } as FleaMarketItemVoting;
  }
}
