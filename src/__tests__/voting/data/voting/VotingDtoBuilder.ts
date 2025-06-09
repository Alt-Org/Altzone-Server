import IDataBuilder from '../../../test_utils/interface/IDataBuilder';
import { Organizer } from '../../../../voting/dto/organizer.dto';
import { Vote } from '../../../../voting/schemas/vote.schema';
import { VotingDto } from '../../../../voting/dto/voting.dto';
import { VotingType } from '../../../../voting/enum/VotingType.enum';
import { ObjectId } from 'mongodb';
import { ItemName } from '../../../../clanInventory/item/enum/itemName.enum';
import { SetClanRole } from '../../../../voting/schemas/setClanRole.schema';

export default class VotingDtoBuilder implements IDataBuilder<VotingDto> {
  private readonly base: Partial<VotingDto> = {
    _id: new ObjectId().toString(),
    organizer: {
      player_id: new ObjectId().toString(),
      clan_id: new ObjectId().toString(),
    },
    startedAt: new Date(),
    endedAt: new Date(Date.now() + 600000),
    endsOn: new Date(Date.now() + 1200000),
    type: VotingType.FLEA_MARKET_BUY_ITEM,
    player_ids: [new ObjectId().toString()],
    minPercentage: 50,
    votes: [],
    fleaMarketItem_id: new ObjectId().toString(),
    shopItemName: undefined,
    setClanRole: undefined,
  };

  build(): VotingDto {
    return { ...this.base } as VotingDto;
  }

  setId(id: string) {
    this.base._id = id;
    return this;
  }

  setOrganizer(organizer: Organizer) {
    this.base.organizer = organizer;
    return this;
  }

  setStartedAt(startedAt: Date) {
    this.base.startedAt = startedAt;
    return this;
  }

  setEndedAt(endedAt: Date) {
    this.base.endedAt = endedAt;
    return this;
  }

  setEndsOn(endsOn: Date) {
    this.base.endsOn = endsOn;
    return this;
  }

  setType(type: VotingType) {
    this.base.type = type;
    return this;
  }

  setPlayerIds(ids: string[]) {
    this.base.player_ids = ids;
    return this;
  }

  setMinPercentage(min: number) {
    this.base.minPercentage = min;
    return this;
  }

  setVotes(votes: Vote[]) {
    this.base.votes = votes;
    return this;
  }

  addVote(vote: Vote) {
    if (!this.base.votes) {
      this.base.votes = [];
    }
    this.base.votes.push(vote);
    return this;
  }

  setFleaMarketItemId(itemId: string) {
    this.base.fleaMarketItem_id = itemId;
    return this;
  }

  setShopItemName(itemName: ItemName) {
    this.base.shopItemName = itemName;
    return this;
  }

  setSetClanRole(setClanRole: SetClanRole) {
    this.base.setClanRole = setClanRole;
    return this;
  }
}
