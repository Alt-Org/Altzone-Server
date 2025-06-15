import { CreateVotingDto } from '../../../../voting/dto/createVoting.dto';
import IDataBuilder from '../../../test_utils/interface/IDataBuilder';
import { Organizer } from '../../../../voting/dto/organizer.dto';
import { Vote } from '../../../../voting/schemas/vote.schema';
import { VotingType } from '../../../../voting/enum/VotingType.enum';
import { ObjectId } from 'mongodb';

export default class CreateVotingDtoBuilder
  implements IDataBuilder<CreateVotingDto>
{
  private readonly base: Partial<CreateVotingDto> = {
    organizer: {
      player_id: new ObjectId().toString(),
      clan_id: new ObjectId().toString(),
    },
    endsOn: new Date(Date.now() + 3600000),
    type: VotingType.FLEA_MARKET_BUY_ITEM,
    minPercentage: 50,
    fleaMarketItem_id: new ObjectId().toString(),
    votes: [],
  };

  build(): CreateVotingDto {
    return { ...this.base } as CreateVotingDto;
  }

  setOrganizer(organizer: Organizer) {
    this.base.organizer = organizer;
    return this;
  }

  setEndsOn(date: Date) {
    this.base.endsOn = date;
    return this;
  }

  setType(type: VotingType) {
    this.base.type = type;
    return this;
  }

  setMinPercentage(min: number) {
    this.base.minPercentage = min;
    return this;
  }

  setFleamarketItemId(itemId: string) {
    this.base.fleaMarketItem_id = itemId;
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
}
