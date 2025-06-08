import IDataBuilder from '../../../test_utils/interface/IDataBuilder';
import { Vote } from '../../../../voting/schemas/vote.schema';
import { VoteChoice } from '../../../../voting/enum/choiceType.enum';
import { ObjectId } from 'mongodb';

export default class VoteBuilder implements IDataBuilder<Vote> {
  private readonly base: Partial<Vote> = {
    player_id: new ObjectId().toString(),
    choice: VoteChoice.YES,
  };

  build(): Vote {
    return { ...this.base } as Vote;
  }

  setPlayerId(playerId: string) {
    this.base.player_id = playerId;
    return this;
  }

  setChoice(choice: VoteChoice) {
    this.base.choice = choice;
    return this;
  }
}
