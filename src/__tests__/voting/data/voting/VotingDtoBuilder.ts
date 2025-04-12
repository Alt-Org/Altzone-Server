import IDataBuilder from '../../../test_utils/interface/IDataBuilder';
import { Organizer } from '../../../../voting/dto/organizer.dto';
import { Vote } from '../../../../voting/schemas/vote.schema';
import { VotingDto } from '../../../../voting/dto/voting.dto';
import { VotingType } from '../../../../voting/enum/VotingType.enum';

export default class VotingDtoBuilder
  implements IDataBuilder<VotingDto>
{
  private readonly base: VotingDto = {
    _id: '',
    organizer: new Organizer(),
    endedAt: undefined,
    startedAt: undefined,
    endsOn: undefined,
    type: VotingType.SELLING_ITEM,
    player_ids: [],
    minPercentage: 0,
    votes: [],
    entity_id: ''
  };

  build(): VotingDto {
    return { ...this.base };
  }

  setOrganizer(organizer: Organizer) {
    this.base.organizer = organizer;
    return this;
  }

setEndsOn(endsOn: Date) {
  this.base.endsOn = endsOn;
  return this;
}

setMinPercentage(minPercentage: number) {
  this.base.minPercentage = minPercentage;
  return this;
}

setEntityId(entity_id: string) {
  this.base.entity_id = entity_id;
  return this;
}

setVotes(votes: Vote[]) {
  this.base.votes = votes;
  return this;
}
}
