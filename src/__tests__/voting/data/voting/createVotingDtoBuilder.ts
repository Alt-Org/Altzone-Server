import { CreateVotingDto } from '../../../../voting/dto/createVoting.dto';
import IDataBuilder from '../../../test_utils/interface/IDataBuilder';
import { Organizer } from '../../../../voting/dto/organizer.dto';
import { Vote } from '../../../../voting/schemas/vote.schema';

export default class CreateVotingDtoBuilder
  implements IDataBuilder<CreateVotingDto>
{
  private readonly base: CreateVotingDto = {
    organizer: { player_id: 'test', clan_id: '67e98660df641b26bb7cbf6b' },
    endsOn: new Date(),
    type: 'selling_item',
    minPercentage: 1,
    votes: [] as Vote[],
    entity_id: '67e98660df641b26bb7cbf6b',
  };

  build(): CreateVotingDto {
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

setType(type: string) {
  this.base.type = type;
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
