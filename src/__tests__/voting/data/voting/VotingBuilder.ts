import { Voting } from '../../../../voting/schemas/voting.schema';
import { VotingType } from '../../../../voting/enum/VotingType.enum';
import { ObjectId } from 'mongodb';
import { Organizer } from '../../../../voting/dto/organizer.dto';
import { Vote } from '../../../../voting/schemas/vote.schema';
import { ItemName } from '../../../../clanInventory/item/enum/itemName.enum';
import { SetClanRole } from '../../../../voting/schemas/setClanRole.schema';

export class VotingBuilder {
  private readonly base: Voting = {
    organizer: {
      player_id: new ObjectId().toString(),
      clan_id: new ObjectId().toString(),
    },
    endsOn: new Date(Date.now() + 10 * 60 * 1000),
    type: VotingType.FLEA_MARKET_BUY_ITEM,
    minPercentage: 51,
    votes: [],
  };

  build(): Voting {
    return { ...this.base } as Voting;
  }

  setOrganizer(organizer: Organizer): this {
    this.base.organizer = organizer;
    return this;
  }

  setEndsOn(date: Date): this {
    this.base.endsOn = date;
    return this;
  }

  setType(type: VotingType): this {
    this.base.type = type;
    return this;
  }

  setMinPercentage(percentage: number): this {
    this.base.minPercentage = percentage;
    return this;
  }

  setVotes(votes: Vote[]): this {
    this.base.votes = votes;
    return this;
  }

  setFleaMarketItemId(id: string): this {
    this.base.fleaMarketItem_id = id;
    return this;
  }

  setShopItem(item: ItemName): this {
    this.base.shopItem = item;
    return this;
  }

  setSetClanRole(role: SetClanRole): this {
    this.base.setClanRole = role;
    return this;
  }
}
