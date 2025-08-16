import { Voting } from '../../../../voting/schemas/voting.schema';
import { VotingType } from '../../../../voting/enum/VotingType.enum';
import { ObjectId } from 'mongodb';
import { Organizer } from '../../../../voting/dto/organizer.dto';
import { Vote } from '../../../../voting/schemas/vote.schema';

export class VotingBuilder {
  protected readonly base: Voting = {
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
}
